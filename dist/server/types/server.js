"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../../src/app");
const PORT = process.env.PORT || 2000;
app_1.app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map