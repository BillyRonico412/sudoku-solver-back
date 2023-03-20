"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sudokuInfoZod = void 0;
const zod_1 = require("zod");
exports.sudokuInfoZod = zod_1.z
    .array(zod_1.z.array(zod_1.z.number().min(0).max(9)))
    .length(9);
