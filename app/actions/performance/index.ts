import { createPerformanceAction } from "./create";
import { endPerformanceAction } from "./end";
import { joinPerformanceAction } from "./join";

export const performanceActionHash = {
  'join-performance': joinPerformanceAction,
  'create-performance': createPerformanceAction,
  'end-performance': endPerformanceAction,
}