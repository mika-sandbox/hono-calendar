import { createRoute } from "honox/factory";
import { Calendar } from "../islands/calendar";

export default createRoute((c) => {
  return c.render(
    <div>
      <Calendar />
    </div>
  );
});
