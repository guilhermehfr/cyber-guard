import type { SubmitAnswerRequest } from "@cyber/contracts";
import { IsNotEmpty, IsString } from "class-validator";

export class SubmitAnswerDto implements SubmitAnswerRequest {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  answerId!: string;
}
