import Image from "next/image";
import db from "@/lib/db";

export default async function Home() {
  "use cache";
  const user = await db.user.findMany();
  return <div>{JSON.stringify(user, null, 2)}</div>;
}
