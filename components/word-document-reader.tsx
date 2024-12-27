/** @format */

"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import mammoth from "mammoth"
import { Button } from "@/components/ui/button"

export default function WordDocumentReader() {
	const [text, setText] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		setIsLoading(true)

		try {
			const arrayBuffer = await file.arrayBuffer()
			const result = await mammoth.extractRawText({ arrayBuffer })
			setText(result.value)
		} catch (error) {
			console.error("Error reading file:", error)
			setText("Error reading file. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	const handleRemovePunctuation = () => {
		const newText = text.replace(/[：:,，.。...…]/g, "\n")
		setText(newText)
	}

	return (
		<div className="max-w-2xl mx-auto p-4 space-y-4">
			<h1 className="text-2xl font-bold">Word Document Reader</h1>
			<div className="flex items-center gap-2">
				<input
					type="file"
					accept=".docx"
					onChange={handleFileUpload}
					id="file-upload"
					className="block w-full text-sm text-slate-500
						file:mr-4 file:py-2 file:px-4
						file:rounded-full file:border-0
						file:text-sm file:font-semibold
						file:bg-violet-50 file:text-violet-700
						hover:file:bg-violet-100"
				/>
				{isLoading && <span className="text-sm text-gray-500">处理中...</span>}
			</div>
			<div className="flex gap-2">
				<Button onClick={handleRemovePunctuation}>替换标点为换行</Button>
			</div>
			<Textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Extracted text will appear here..."
				className="h-64"
			/>
		</div>
	)
}
