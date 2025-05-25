import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
import * as glob from 'glob';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Project, SourceFile, Type } from 'ts-morph';

@Injectable()
@Command({ name: 'generate-types', description: 'Generate TypeScript types from the API' })
export class GenerateTypesCommand extends CommandRunner {
  private project: Project;
  private printedEnums = new Set<string>();
  private processedFiles = new Set<string>();
  private enumLines: string[] = [];
  private typeLines: string[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async run(_inputs: string[], options: { output?: string }): Promise<void> {
    const outputPath = options?.['output'] as string;

    if (!outputPath) {
      console.error('❌ Argument --output is required!');
      return;
    }

    this.project = new Project({
      tsConfigFilePath: path.resolve(__dirname, '../../', 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false,
    });

    const dtoFiles = glob.sync('src/**/*.dto.ts', {
      cwd: process.cwd(),
      absolute: true,
    });

    this.collectEnums();

    for (const filePath of dtoFiles) {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      this.processDtoFile(sourceFile);
    }

    const outputLines = [
      '/* This file is auto-generated. Do not edit it manually. */\n',
      '\n',
      ...this.enumLines,
      ...this.typeLines,
    ];

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputLines.join('').trimEnd() + '\n', 'utf-8');

    console.log(`✅ Types generated successfully at ${outputPath}`);
  }

  @Option({ name: 'output', flags: '-o, --output <output>', description: 'Path to the output file' })
  parseOutput(val: string): string {
    return path.resolve(val);
  }

  private collectEnums(): void {
    // Find all TypeScript files that might contain enums
    const enumFiles = glob.sync(['src/**/*.constants.ts', 'src/**/*.enum.ts'], {
      cwd: process.cwd(),
      absolute: true,
    });

    for (const filePath of enumFiles) {
      if (filePath.includes('node_modules')) continue;

      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const enums = sourceFile.getEnums();

      for (const enumDecl of enums) {
        const enumName = enumDecl.getName();
        if (!this.printedEnums.has(enumName)) {
          this.printedEnums.add(enumName);
          this.enumLines.push(enumDecl.getText() + '\n\n');
        }
      }
    }
  }

  private processDtoFile(sourceFile: SourceFile): void {
    const filePath = sourceFile.getFilePath();
    if (this.processedFiles.has(filePath) || filePath.includes('node_modules')) {
      return;
    }
    this.processedFiles.add(filePath);

    for (const classDecl of sourceFile.getClasses()) {
      const className = classDecl.getName();
      if (!className) continue;

      const props = classDecl.getProperties();
      const objectFields: string[] = [];

      for (const prop of props) {
        const name = prop.getName();
        const isOptional = prop.hasQuestionToken();
        const type = prop.getType();

        let field = `  ${name}${isOptional ? '?' : ''}: ${type.getText(prop)};`;
        if (isOptional) field = field.replace(' | undefined', '');
        objectFields.push(field);
      }

      const typeParams = classDecl.getTypeParameters().map((p) => p.getText());
      const typeParamString = typeParams.length > 0 ? `<${typeParams.join(', ')}>` : '';
      this.typeLines.push(`export type ${className}${typeParamString} = {\n${objectFields.join('\n')}\n};\n\n`);
    }
  }

  private findAndInlineEnums(sourceFile: SourceFile, type: Type, visitedTypes: Set<string>): void {
    const typeName = type.getText().split('<')[0].trim();

    if (visitedTypes.has(typeName)) {
      return;
    }
    visitedTypes.add(typeName);

    this.checkForEnum(sourceFile, typeName);

    if (type.isUnion()) {
      type.getUnionTypes().forEach((unionType) => {
        this.findAndInlineEnums(sourceFile, unionType, visitedTypes);
      });
    }

    if (type.isArray()) {
      const elementType = type.getArrayElementType();
      if (elementType) {
        this.findAndInlineEnums(sourceFile, elementType, visitedTypes);
      }
    }
  }

  private checkForEnum(sourceFile: SourceFile, typeName: string): void {
    if (this.printedEnums.has(typeName)) return;

    const enumDecl = sourceFile.getEnum(typeName);
    if (enumDecl) {
      this.printedEnums.add(typeName);
      this.enumLines.push(enumDecl.getText() + '\n');
      return;
    }

    const imports = sourceFile.getImportDeclarations();
    for (const importDecl of imports) {
      const namedImports = importDecl.getNamedImports();
      for (const namedImport of namedImports) {
        const name = namedImport.getName();
        if (name !== typeName) continue;

        const resolvedSource = importDecl.getModuleSpecifierSourceFile();
        if (!resolvedSource || resolvedSource.getFilePath().includes('node_modules')) continue;

        const enumDecl = resolvedSource.getEnum(typeName);
        if (!enumDecl) continue;

        this.printedEnums.add(typeName);
        this.enumLines.push(enumDecl.getText() + '\n');
        return;
      }
    }
  }
}
