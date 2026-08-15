import { createTreeDataRouter } from "@/utils/createTreeDataRouter";
import { buildAutoMenu } from "@/utils/buildAutoMenu";

export const menuRouter = createTreeDataRouter("menu", "menu", buildAutoMenu);
