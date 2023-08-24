import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const originId = url.searchParams.get("originId");
  const destinationId = url.searchParams.get("destinationId");
  const response = await fetch(`http://10.0.0.248:3000/directions?originId=${originId}&destinationId=${destinationId}`, {
    next: {
      revalidate: 1,
    }
  });

  return NextResponse.json(await response.json());
}