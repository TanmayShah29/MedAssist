import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve('.env.local') })

const GEMINI_API_KEY = 'AIzaSyBb_nUrG5jJOta04eWqCP0KpibIlZ8yGEM'
const PDF_PATH = resolve('./real_lab_report.pdf')

console.log('Using API Key:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'UNDEFINED')
console.log('Reading PDF from:', PDF_PATH)

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

async function test() {
    try {
        console.log('Reading PDF...')
        const pdfBuffer = readFileSync(PDF_PATH)
        const base64 = pdfBuffer.toString('base64')
        console.log('PDF size:', Math.round(base64.length / 1024), 'KB')

        console.log('Calling Gemini...')
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: base64
                }
            },
            {
                text: 'Extract all text from this lab report. Return raw text only.'
            }
        ])

        const text = result.response.text()
        console.log('SUCCESS — Extracted text length:', text.length)
        console.log('First 500 chars:')
        console.log(text.substring(0, 500))

    } catch (error) {
        console.error('FAILED:', error.message)
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        if (error.response) {
            console.error('Response body:', await error.response.text().catch(() => 'No body'))
        }
    }
}

test()
