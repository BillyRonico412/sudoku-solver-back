import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import type { SudokuInfoType } from './interface'
import { sudokuInfoZod } from './interface'
import { solve } from './logic/logic'

dotenv.config()

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())

app.post('/', (req, res) => {
  void (async (req, res): Promise<express.Response> => {
    const body = req.body
    if (!sudokuInfoZod.safeParse(body).success) {
      return res.status(400).end()
    }
    const sudokuInfo = body as SudokuInfoType
    const satRes = await solve(sudokuInfo)
    if (satRes === null) {
      return res.status(400).end()
    }
    return res.status(200).json(satRes)
  })(req, res)
})

app.listen(process.env.PORT, () => {
  console.log(`Listen to :${process.env.PORT as string}`)
})
