const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");

router.use(auth);

router.post("/", customerController.addCustomer);
router.get("/", customerController.getCustomers);
router.post("/pay/:id", customerController.payCustomer);
router.post("/unpay/:id", customerController.unpayCustomer);
router.put("/:id", customerController.editCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
