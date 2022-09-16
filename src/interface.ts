import * as yup from 'yup';

export interface SatResInterface {
    is: boolean;
    res: number[];
}

export type SudokuInfoType = number[][];

export type ClauseType = number[][];

export interface VariableInterface {
    ligne: number; // Ligne entre 0 à 8
    colonne: number; // Col entre 0 à 8
    valeur: number; // Valeur 0 à 8
}

export const sudokuInfoYup = yup
    .array()
    .length(9)
    .of(yup.array().length(9).of(yup.number().min(0).max(9)));
