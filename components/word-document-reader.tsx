/** @format */

"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import mammoth from "mammoth"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function WordDocumentReader() {
	const [text, setText] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [showExportDialog, setShowExportDialog] = useState(false)
	const [duration, setDuration] = useState([3]) // 默认3秒

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

	const handleRemoveEmptyLines = () => {
		const newText = text
			.split("\n")
			.filter((line) => line.trim() !== "")
			.join("\n")
		setText(newText)
	}

	const hasEmptyLines = () => {
		return text.split("\n").some((line) => line.trim() === "")
	}

	const exportToSrt = () => {
		// 将文本按行分割
		const lines = text.split("\n").filter((line) => line.trim() !== "")

		let srtContent = ""
		lines.forEach((line, index) => {
			const number = index + 1
			// 使用用户设置的时间
			const startTime = formatTime(index * duration[0])
			const endTime = formatTime((index + 1) * duration[0])

			srtContent += `${number}\n`
			srtContent += `${startTime} --> ${endTime}\n`
			srtContent += `${line}\n\n`
		})

		// 创建并下载文件
		const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "subtitle.srt"
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		setShowExportDialog(false)
	}

	// 格式化时间为 SRT 格式 (00:00:00,000)
	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const secs = Math.floor(seconds % 60)
		const millisecs = Math.floor((seconds % 1) * 1000)

		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
			2,
			"0"
		)}:${String(secs).padStart(2, "0")},${String(millisecs).padStart(3, "0")}`
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
				<Button onClick={handleRemovePunctuation} disabled={!text.trim()}>
					替换标点为换行
				</Button>
				<Button
					onClick={() => setShowExportDialog(true)}
					variant="outline"
					disabled={!text.trim()}>
					导出SRT字幕
				</Button>
				<Button
					onClick={handleRemoveEmptyLines}
					variant="outline"
					disabled={!text.trim() || !hasEmptyLines()}>
					删除空行
				</Button>
			</div>
			<Textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Extracted text will appear here..."
				className="h-64"
			/>

			<Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>设置字幕时间</DialogTitle>
					</DialogHeader>
					<div className="py-4 space-y-4">
						<div className="space-y-2">
							<Label>每行字幕显示时间（秒）: {duration[0]}</Label>
							<Slider
								value={duration}
								onValueChange={setDuration}
								min={1}
								max={10}
								step={0.5}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowExportDialog(false)}>
							取消
						</Button>
						<Button onClick={exportToSrt}>确认导出</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
