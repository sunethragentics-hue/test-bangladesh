import { createFileRoute } from "@tanstack/react-router";
import ForecastApp from "@/components/ForecastApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ForecastApp />;
}
