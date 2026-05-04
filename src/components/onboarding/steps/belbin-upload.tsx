'use client'

import * as React from 'react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface BelbinUploadProps {
  onSkip: () => void
  onUploaded: () => void
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export function BelbinUpload({ onSkip, onUploaded }: BelbinUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Palun lae üles PDF-fail.')
      return
    }

    setFileName(file.name)
    setErrorMessage(null)
    setUploadState('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/belbin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      setUploadState('success')
      onUploaded()
    } catch {
      setUploadState('error')
      setErrorMessage('Üleslaadimine ebaõnnestus. Proovi uuesti.')
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Belbini aruanne{' '}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-normal"
            style={{
              background: '#f3f4f6',
              color: 'var(--pz-fg-3)',
            }}
          >
            Vabatahtlik
          </span>
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--pz-fg-3)' }}>
          Belbini meeskonna rollide mudel aitab AI-l mõista sinu tugevusi ja
          suhtlusstiili. Kui sul on Belbini aruanne PDF-formaadis, laadi see
          üles — see jääb privaatseks ja ainult sinu juhile nähtavaks.
        </p>
      </div>

      {/* Upload area */}
      {uploadState === 'success' ? (
        <SuccessState fileName={fileName!} />
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center gap-4 rounded-[10px] border-2 border-dashed p-8 text-center transition-colors"
          style={{
            borderColor: 'var(--pz-border)',
            background: 'var(--pz-surface)',
            transitionDuration: 'var(--pz-dur-base)',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          aria-label="Lae üles Belbini aruanne"
        >
          <div
            className="flex size-12 items-center justify-center rounded-xl text-2xl"
            style={{
              background: '#f5f0ff',
            }}
            aria-hidden="true"
          >
            📄
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium" style={{ color: 'var(--pz-fg-1)' }}>
              {uploadState === 'uploading'
                ? 'Laen üles...'
                : 'Lohista siia või klõpsa faili valimiseks'}
            </p>
            <p className="text-xs" style={{ color: 'var(--pz-fg-3)' }}>
              Ainult PDF, kuni 10 MB
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium" style={{ color: 'var(--pz-danger)' }}>
              {errorMessage}
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          {uploadState !== 'uploading' && (
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              style={{
                background: 'var(--pz-grad-primary)',
                color: 'white',
                borderRadius: 'var(--pz-radius-md)',
                border: 'none',
              }}
            >
              Laadi üles
            </Button>
          )}

          {uploadState === 'uploading' && (
            <div
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--pz-border)' }}
            >
              <div
                className="h-full animate-pulse rounded-full"
                style={{
                  background: 'var(--pz-grad-primary)',
                  width: '60%',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Skip link */}
      {uploadState !== 'success' && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm underline-offset-4 hover:underline"
            style={{ color: 'var(--pz-fg-3)' }}
          >
            Jäta vahele
          </button>
        </div>
      )}
    </div>
  )
}

function SuccessState({ fileName }: { fileName: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-[10px] p-5"
      style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
      }}
    >
      <span className="text-2xl" aria-hidden="true">
        ✅
      </span>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#15803d' }}>
          Aruanne üles laetud
        </p>
        <p className="text-xs" style={{ color: '#166534' }}>
          {fileName}
        </p>
      </div>
    </div>
  )
}
