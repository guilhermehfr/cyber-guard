import type { NextProxy } from "next/server";
import { NextResponse } from "next/server";

export const proxy: NextProxy = () => NextResponse.next();
