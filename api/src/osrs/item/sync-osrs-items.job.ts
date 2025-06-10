import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import puppeteer from 'puppeteer';
import { Repository } from 'typeorm';

import type { Job } from '@/jobs/job';

import { OsrsItem } from './osrs-item.entity';

export type SyncOsrsItemsParams = object;

export class SyncOsrsItemsJob implements Job<SyncOsrsItemsParams> {
  public readonly queue = 'sync-osrs-items';
}

type Item = {
  id: number;
  name: string;
  configName: string;
  examine: string;
  imageUrl: string;
  exchangeable: boolean;
  members: boolean;
  category: number;
};

type ItemOrVariant = Exclude<Item, 'id' | 'imageUrl' | 'name'> & {
  id: number | null;
  imageUrl: string | null;
  name: string | null;
};

@Injectable()
@Processor('sync-osrs-items')
export class SyncOsrsItemsProcessor extends WorkerHost {
  private readonly ITEM_NAME_BLACKLIST = ['template_for_placeholder'];
  private readonly PAGE_SIZE = 1000;
  private readonly ID_LIMIT = 30888; // As of 2025-05-22, the highest item ID is 30888.
  private readonly BATCH_SIZE = 1000;
  private readonly BASE_URL = 'https://chisel.weirdgloop.org';
  private readonly ITEM_URL = `${this.BASE_URL}/moid/item_id.html`;

  private readonly logger = new Logger(SyncOsrsItemsProcessor.name);
  private readonly items: Item[] = [];

  private lastItem: Item | null = null;

  constructor(
    @InjectRepository(OsrsItem)
    private readonly osrsItemRepository: Repository<OsrsItem>,
  ) {
    super();
  }

  async process(): Promise<void> {
    await this.scrapeItems();
    if (this.items.length === 0) {
      this.logger.log('No items scraped, skipping upsert.');
      return;
    }

    await this.batchUpsertItems();
    this.logger.log(`Synced ${this.items.length} items successfully.`);
  }

  private async scrapeItems(): Promise<void> {
    let start = 1;
    let nextPageUrl = `${this.ITEM_URL}#${start}+${this.PAGE_SIZE}`;

    while (true) {
      try {
        const $ = await this.fetchPage(nextPageUrl);
        const processedItemsCount = this.scrapePage($);
        this.logger.log(`Scraped ${processedItemsCount} items. Total items: ${this.items.length}`);

        start += this.PAGE_SIZE;
        if (start > this.ID_LIMIT) break;

        nextPageUrl = `${this.ITEM_URL}#${start}+${this.PAGE_SIZE}`;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error fetching ${nextPageUrl}.`, message, 'Retrying in 30 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 30000));
        continue;
      }
    }
  }

  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.waitForSelector('td.name', { timeout: 10000 });

      const html = await page.content();
      await browser.close();

      return cheerio.load(html);
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  private scrapePage($: cheerio.CheerioAPI): number {
    const $items = $('tr:not(#header-row):not(:first-child)');

    $items.each((_, element) => {
      const item = this.scrapeItemFromPage($(element));
      if (this.ITEM_NAME_BLACKLIST.includes(item.configName)) return;

      if (item.name === null) {
        if (this.lastItem === null || !item.configName.startsWith(this.lastItem.configName) || item.imageUrl === null)
          return;

        this.lastItem.imageUrl = item.imageUrl;
        return;
      }

      if (item.id === null || item.imageUrl === null) return;

      this.items.push(item);
      this.lastItem = item;
    });

    return $items.length;
  }

  private scrapeItemFromPage($item: cheerio.Cheerio<Element>): ItemOrVariant {
    const imageUrl = $item.find('td:nth-child(1) img').attr('src');
    const id = this.getColumnText($item, 2);
    const name = this.getColumnText($item, 3);
    const configName = this.getColumnText($item, 4);
    const exchangeable = this.getColumnText($item, 5);
    const members = this.getColumnText($item, 6);
    const examine = this.getColumnText($item, 9);
    const category = this.getColumnText($item, 17);

    return {
      imageUrl: imageUrl ? `${this.BASE_URL}${imageUrl}` : null,
      id: id ? Number(id) : null,
      name: name.trim() === '' || name.toLowerCase() === 'null' ? null : name,
      configName,
      exchangeable: exchangeable === 'true',
      members: members === 'true',
      examine,
      category: category ? Number(category) : -2,
    } as ItemOrVariant;
  }

  private getColumnText($item: cheerio.Cheerio<Element>, columnIndex: number): string {
    return $item.find(`td:nth-child(${columnIndex})`).text().trim();
  }

  private async batchUpsertItems(): Promise<void> {
    let start = 0;

    while (true) {
      const batch = this.items.slice(start, start + this.BATCH_SIZE);
      if (batch.length === 0) return;

      const batchItems = batch.map((item) => ({
        id: item.id,
        name: item.name,
        configName: item.configName,
        examine: item.examine,
        imageUrl: item.imageUrl,
        exchangeable: item.exchangeable,
        members: item.members,
        category: item.category,
      })) satisfies Partial<OsrsItem>[];

      await this.osrsItemRepository.upsert(batchItems, {
        conflictPaths: ['id'],
        skipUpdateIfNoValuesChanged: true,
      });

      start += this.BATCH_SIZE;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
