export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  const url = "https://eaglethorondor.app.n8n.cloud/webhook/remove-background";
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const body = Buffer.concat(chunks);
  const ct = req.headers["content-type"] || "application/octet-stream";
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": ct as string },
    body,
  });
  const contentType = r.headers.get("content-type") || "application/octet-stream";
  const buf = Buffer.from(await r.arrayBuffer());
  res.status(r.status);
  res.setHeader("content-type", contentType);
  res.send(buf);
}
