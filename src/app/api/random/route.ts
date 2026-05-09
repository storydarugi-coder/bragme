import { pickRandomCardId } from "@/lib/cards-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const id = await pickRandomCardId();
    if (!id) {
      return Response.json(
        { error: { code: "EMPTY", message: "No cards yet." } },
        { status: 404 },
      );
    }
    return Response.json({ id });
  } catch (err) {
    console.error("[random] db error", err);
    return Response.json(
      { error: { code: "DB_FAILED", message: "Couldn't pick one." } },
      { status: 500 },
    );
  }
}
