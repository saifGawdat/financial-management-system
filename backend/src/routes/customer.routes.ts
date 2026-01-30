import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const customerController = new CustomerController();

router.post("/", auth, customerController.addCustomer);
router.get("/", auth, customerController.getCustomers);
router.post("/pay/:id", auth, customerController.payCustomer);
router.post("/unpay/:id", auth, customerController.unpayCustomer);
router.put("/:id", auth, customerController.updateCustomer);
router.delete("/:id", auth, customerController.deleteCustomer);

export default router;
