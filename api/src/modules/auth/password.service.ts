import { Injectable } from "@nestjs/common";
import { hash, verify } from "argon2";

@Injectable()
export class PasswordService {
  hash(password: string): Promise<string> {
    return hash(password);
  }

  verify(password: string, storedHash: string): Promise<boolean> {
    return verify(storedHash, password);
  }
}
