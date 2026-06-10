import { cookies } from "next/headers";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let firstName = "User";

  if (token) {
    try {
      const payloadBase64Url = token.split(".")[1];
      if (payloadBase64Url) {
        const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        if (payload.firstName) {
          firstName = payload.firstName;
        }
      }
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h1 className="text-4xl font-bold text-primary">Hi, {firstName}</h1>
      <p className="mt-4 text-muted-foreground text-center max-w-md">
        Welcome to Pulsebook, your healthcare appointment booking platform.
        Use the sidebar to navigate through the different modules.
      </p>
    </div>
  );
}
