import { Controller, Get } from "@nestjs/common";

@Controller("service-health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "pulsebook-api",
      timestamp: new Date().toISOString()
    };
  }
}
