import { BingoParticipant } from "@/bingo-participant/bingo-participant.entity";
import { Bingo } from "../bingo.entity";

export class BingoRequest extends Request {
    bingo: Bingo;
    bingoParticipant: BingoParticipant;
}