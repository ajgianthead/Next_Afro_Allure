import { Queue, Worker } from "bullmq";
import { NextRequest, NextResponse } from "next/server";
import { redisConnection } from "../../../../redis";
import { runTotalReport, trackAppointmentBooked } from "../../../../lib/analytics";

export async function GET(request: NextRequest) {
    await runTotalReport({})
    return NextResponse.json({message: 'done'})
}
