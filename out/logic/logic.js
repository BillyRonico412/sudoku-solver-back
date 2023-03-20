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
exports.solve = exports.satResToSudokuInfo = exports.sudokuInfoToClauses = exports.clause6 = exports.clause5 = exports.clause4 = exports.clause3 = exports.clause2 = exports.clause1 = exports.dimacsToVariable = exports.variableToDimacs = exports.testSudokuInfo = exports.execSat4J = void 0;
const util_1 = require("util");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const execSat4J = (src) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stdout, stderr } = yield (0, util_1.promisify)(child_process_1.exec)(`java -jar sat4j.jar MiniSAT ${src}`);
        if (stderr !== '') {
            return null;
        }
        const resLine = stdout.split('\n');
        if (resLine.length === 7) {
            return { is: false, res: [] };
        }
        if (resLine.length === 10) {
            if (resLine[7].split(' ')[1] === 'UNSATISFIABLE') {
                return { is: false, res: [] };
            }
        }
        const resArray = resLine[8].split(' ');
        const res = resArray.slice(1, resArray.length - 1).map(Number);
        return { is: true, res };
    }
    catch (err) {
        console.log(err);
        return null;
    }
});
exports.execSat4J = execSat4J;
const testSudokuInfo = (sudokuInfo) => sudokuInfo.length === 9 &&
    sudokuInfo.every((sudokuInfoLine) => sudokuInfoLine.length === 9 &&
        sudokuInfoLine.every((item) => item >= 0 && item <= 9));
exports.testSudokuInfo = testSudokuInfo;
const variableToDimacs = (variable) => variable.ligne * 81 + variable.colonne * 9 + variable.valeur + 1;
exports.variableToDimacs = variableToDimacs;
const dimacsToVariable = (varDimacs) => ({
    ligne: Math.floor((varDimacs - 1) / 81),
    colonne: Math.floor(((varDimacs - 1) % 81) / 9),
    valeur: ((varDimacs - 1) % 81) % 9,
});
exports.dimacsToVariable = dimacsToVariable;
// Pour chaque case, on a au plus une valeur
const clause1 = () => {
    const res = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            for (let k1 = 0; k1 < 9; k1++) {
                for (let k2 = k1 + 1; k2 < 9; k2++) {
                    res.push([
                        -1 *
                            (0, exports.variableToDimacs)({
                                ligne: i,
                                colonne: j,
                                valeur: k1,
                            }),
                        -1 *
                            (0, exports.variableToDimacs)({
                                ligne: i,
                                colonne: j,
                                valeur: k2,
                            }),
                    ]);
                }
            }
        }
    }
    return res;
};
exports.clause1 = clause1;
// Pour chaque case, on a au moins une valeur
const clause2 = () => {
    const res = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const clause = [];
            for (let k = 0; k < 9; k++) {
                clause.push((0, exports.variableToDimacs)({ ligne: i, colonne: j, valeur: k }));
            }
            res.push(clause);
        }
    }
    return res;
};
exports.clause2 = clause2;
// Sur une ligne, pas deux fois la même valeur
const clause3 = () => {
    const res = [];
    for (let i = 0; i < 9; i++) {
        for (let k = 0; k < 9; k++) {
            for (let j1 = 0; j1 < 9; j1++) {
                for (let j2 = j1 + 1; j2 < 9; j2++) {
                    res.push([
                        -1 *
                            (0, exports.variableToDimacs)({
                                ligne: i,
                                colonne: j1,
                                valeur: k,
                            }),
                        -1 *
                            (0, exports.variableToDimacs)({
                                ligne: i,
                                colonne: j2,
                                valeur: k,
                            }),
                    ]);
                }
            }
        }
    }
    return res;
};
exports.clause3 = clause3;
// Sur une colonne, pas deux fois la même valeur
const clause4 = () => {
    const res = [];
    for (let j = 0; j < 9; j++) {
        for (let k = 0; k < 9; k++) {
            for (let i1 = 0; i1 < 9; i1++) {
                for (let i2 = i1 + 1; i2 < 9; i2++) {
                    res.push([
                        -1 *
                            (0, exports.variableToDimacs)({
                                ligne: i1,
                                colonne: j,
                                valeur: k,
                            }),
                        -1 *
                            (0, exports.variableToDimacs)({
                                ligne: i2,
                                colonne: j,
                                valeur: k,
                            }),
                    ]);
                }
            }
        }
    }
    return res;
};
exports.clause4 = clause4;
// Sur un bloc, pas deux fois la même valeur
const clause5 = () => {
    const res = [];
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let k = 0; k < 9; k++) {
                for (let i1 = x * 3; i1 < (x + 1) * 3; i1++) {
                    for (let j1 = y * 3; j1 < (y + 1) * 3; j1++) {
                        for (let i2 = x * 3; i2 < (x + 1) * 3; i2++) {
                            for (let j2 = y * 3; j2 < (y + 1) * 3; j2++) {
                                if (i1 !== i2 || j1 !== j2) {
                                    res.push([
                                        -1 *
                                            (0, exports.variableToDimacs)({
                                                ligne: i1,
                                                colonne: j1,
                                                valeur: k,
                                            }),
                                        -1 *
                                            (0, exports.variableToDimacs)({
                                                ligne: i2,
                                                colonne: j2,
                                                valeur: k,
                                            }),
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return res;
};
exports.clause5 = clause5;
// Contrainte imposé par le jeu
const clause6 = (sudokuInfo) => {
    const res = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuInfo[i][j] !== 0) {
                res.push([
                    (0, exports.variableToDimacs)({
                        ligne: i,
                        colonne: j,
                        valeur: sudokuInfo[i][j] - 1,
                    }),
                ]);
            }
        }
    }
    return res;
};
exports.clause6 = clause6;
const sudokuInfoToClauses = (sudokuInfo) => {
    if (!(0, exports.testSudokuInfo)(sudokuInfo)) {
        return null;
    }
    return [
        ...(0, exports.clause1)(),
        ...(0, exports.clause2)(),
        ...(0, exports.clause3)(),
        ...(0, exports.clause4)(),
        ...(0, exports.clause5)(),
        ...(0, exports.clause6)(sudokuInfo),
    ];
};
exports.sudokuInfoToClauses = sudokuInfoToClauses;
const satResToSudokuInfo = (satRes) => {
    const variables = satRes.res.filter((v) => v > 0).map(exports.dimacsToVariable);
    const result = [];
    for (let i = 0; i < 9; i++) {
        result.push([]);
        for (let j = 0; j < 9; j++) {
            result[i].push(0);
        }
    }
    for (const variable of variables) {
        result[variable.ligne][variable.colonne] = variable.valeur + 1;
    }
    return result;
};
exports.satResToSudokuInfo = satResToSudokuInfo;
const solve = (sudokuInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const clauses = (0, exports.sudokuInfoToClauses)(sudokuInfo);
    if (clauses === null) {
        return null;
    }
    // Create string
    let resString = `p cnf ${9 * 9 * 9} ${clauses.length}\n`;
    clauses.forEach((clause) => (resString += `${clause
        .map(String)
        .reduce((v1, v2) => v1 + ' ' + v2)} 0\n`));
    const writer = (0, util_1.promisify)(fs_1.default.appendFile);
    const deleter = (0, util_1.promisify)(fs_1.default.unlink);
    const fileName = (0, uuid_1.v4)();
    try {
        // Create File
        yield writer(fileName, resString);
        // Solve File
        const satRes = yield (0, exports.execSat4J)(fileName);
        if (satRes === null) {
            return null;
        }
        if (!satRes.is) {
            return null;
        }
        const sudokuInfoRes = (0, exports.satResToSudokuInfo)(satRes);
        return sudokuInfoRes;
    }
    catch (e) {
        console.log(e);
        return null;
    }
    finally {
        // Delete File
        yield deleter(fileName);
    }
});
exports.solve = solve;
