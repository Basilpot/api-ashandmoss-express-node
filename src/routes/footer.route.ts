import { createTreeDataRouter } from "@/utils/createTreeDataRouter";
import { buildAutoFooter } from "@/utils/buildAutoFooter";

export const footerRouter = createTreeDataRouter("footer", "footer", buildAutoFooter);
