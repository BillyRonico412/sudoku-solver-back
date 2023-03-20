import { promisify } from 'util'
import { exec } from 'child_process'
import type {
  ClauseType,
  SatResInterface,
  SudokuInfoType,
  VariableInterface,
} from '../interface'
import fs from 'fs'
import { v4 } from 'uuid'

export const execSat4J = async (
  src: string
): Promise<SatResInterface | null> => {
  try {
    const { stdout, stderr } = await promisify(exec)(
      `java -jar sat4j.jar MiniSAT ${src}`
    )
    if (stderr !== '') {
      return null
    }
    const resLine = stdout.split('\n')
    if (resLine.length === 7) {
      return { is: false, res: [] }
    }
    if (resLine.length === 10) {
      if (resLine[7].split(' ')[1] === 'UNSATISFIABLE') {
        return { is: false, res: [] }
      }
    }
    const resArray = resLine[8].split(' ')
    const res = resArray.slice(1, resArray.length - 1).map(Number)
    return { is: true, res }
  } catch (err) {
    console.log(err)
    return null
  }
}

export const testSudokuInfo = (sudokuInfo: SudokuInfoType): boolean =>
  sudokuInfo.length === 9 &&
  sudokuInfo.every(
    (sudokuInfoLine) =>
      sudokuInfoLine.length === 9 &&
      sudokuInfoLine.every((item) => item >= 0 && item <= 9)
  )

export const variableToDimacs = (variable: VariableInterface): number =>
  variable.ligne * 81 + variable.colonne * 9 + variable.valeur + 1

export const dimacsToVariable = (varDimacs: number): VariableInterface => ({
  ligne: Math.floor((varDimacs - 1) / 81),
  colonne: Math.floor(((varDimacs - 1) % 81) / 9),
  valeur: ((varDimacs - 1) % 81) % 9,
})

// Pour chaque case, on a au plus une valeur
export const clause1 = (): ClauseType => {
  const res: ClauseType = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      for (let k1 = 0; k1 < 9; k1++) {
        for (let k2 = k1 + 1; k2 < 9; k2++) {
          res.push([
            -1 *
              variableToDimacs({
                ligne: i,
                colonne: j,
                valeur: k1,
              }),
            -1 *
              variableToDimacs({
                ligne: i,
                colonne: j,
                valeur: k2,
              }),
          ])
        }
      }
    }
  }
  return res
}

// Pour chaque case, on a au moins une valeur
export const clause2 = (): ClauseType => {
  const res: ClauseType = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const clause: number[] = []
      for (let k = 0; k < 9; k++) {
        clause.push(variableToDimacs({ ligne: i, colonne: j, valeur: k }))
      }
      res.push(clause)
    }
  }
  return res
}

// Sur une ligne, pas deux fois la même valeur
export const clause3 = (): ClauseType => {
  const res: ClauseType = []
  for (let i = 0; i < 9; i++) {
    for (let k = 0; k < 9; k++) {
      for (let j1 = 0; j1 < 9; j1++) {
        for (let j2 = j1 + 1; j2 < 9; j2++) {
          res.push([
            -1 *
              variableToDimacs({
                ligne: i,
                colonne: j1,
                valeur: k,
              }),
            -1 *
              variableToDimacs({
                ligne: i,
                colonne: j2,
                valeur: k,
              }),
          ])
        }
      }
    }
  }
  return res
}

// Sur une colonne, pas deux fois la même valeur
export const clause4 = (): ClauseType => {
  const res: ClauseType = []
  for (let j = 0; j < 9; j++) {
    for (let k = 0; k < 9; k++) {
      for (let i1 = 0; i1 < 9; i1++) {
        for (let i2 = i1 + 1; i2 < 9; i2++) {
          res.push([
            -1 *
              variableToDimacs({
                ligne: i1,
                colonne: j,
                valeur: k,
              }),
            -1 *
              variableToDimacs({
                ligne: i2,
                colonne: j,
                valeur: k,
              }),
          ])
        }
      }
    }
  }
  return res
}

// Sur un bloc, pas deux fois la même valeur
export const clause5 = (): ClauseType => {
  const res: ClauseType = []
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
                      variableToDimacs({
                        ligne: i1,
                        colonne: j1,
                        valeur: k,
                      }),
                    -1 *
                      variableToDimacs({
                        ligne: i2,
                        colonne: j2,
                        valeur: k,
                      }),
                  ])
                }
              }
            }
          }
        }
      }
    }
  }
  return res
}

// Contrainte imposé par le jeu
export const clause6 = (sudokuInfo: SudokuInfoType): ClauseType => {
  const res: ClauseType = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (sudokuInfo[i][j] !== 0) {
        res.push([
          variableToDimacs({
            ligne: i,
            colonne: j,
            valeur: sudokuInfo[i][j] - 1,
          }),
        ])
      }
    }
  }
  return res
}

export const sudokuInfoToClauses = (
  sudokuInfo: SudokuInfoType
): ClauseType | null => {
  if (!testSudokuInfo(sudokuInfo)) {
    return null
  }
  return [
    ...clause1(),
    ...clause2(),
    ...clause3(),
    ...clause4(),
    ...clause5(),
    ...clause6(sudokuInfo),
  ]
}

export const satResToSudokuInfo = (satRes: SatResInterface): SudokuInfoType => {
  const variables = satRes.res.filter((v) => v > 0).map(dimacsToVariable)
  const result: SudokuInfoType = []
  for (let i = 0; i < 9; i++) {
    result.push([])
    for (let j = 0; j < 9; j++) {
      result[i].push(0)
    }
  }
  for (const variable of variables) {
    result[variable.ligne][variable.colonne] = variable.valeur + 1
  }
  return result
}

export const solve = async (
  sudokuInfo: SudokuInfoType
): Promise<SudokuInfoType | null> => {
  const clauses = sudokuInfoToClauses(sudokuInfo)
  if (clauses === null) {
    return null
  }
  // Create string
  let resString = `p cnf ${9 * 9 * 9} ${clauses.length}\n`
  clauses.forEach(
    (clause) =>
      (resString += `${clause
        .map(String)
        .reduce((v1, v2) => v1 + ' ' + v2)} 0\n`)
  )
  const writer = promisify(fs.appendFile)
  const deleter = promisify(fs.unlink)
  const fileName = v4()
  try {
    // Create File
    await writer(fileName, resString)
    // Solve File
    const satRes = await execSat4J(fileName)
    if (satRes === null) {
      return null
    }
    if (!satRes.is) {
      return null
    }
    const sudokuInfoRes = satResToSudokuInfo(satRes)
    return sudokuInfoRes
  } catch (e) {
    console.log(e)
    return null
  } finally {
    // Delete File
    await deleter(fileName)
  }
}
