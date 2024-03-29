"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const interface_1 = require("./interface");
const logic_1 = require("./logic/logic");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(body_parser_1.default.json());
app.post('/', (req, res) => {
    void ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        if (!interface_1.sudokuInfoZod.safeParse(body).success) {
            return res.status(400).end();
        }
        const sudokuInfo = body;
        const satRes = yield (0, logic_1.solve)(sudokuInfo);
        if (satRes === null) {
            return res.status(400).end();
        }
        return res.status(200).json(satRes);
    }))(req, res);
});
app.listen(process.env.PORT, () => {
    console.log(`Listen to :${process.env.PORT}`);
});
