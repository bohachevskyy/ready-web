import { useState, useEffect, useCallback, useRef } from 'react'

export interface SpeakOptions {
  rate?: number
  voice?: string
}

export interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeakOptions) => void
  cancel: () => void
  speaking: boolean
  supported: boolean
  voices: SpeechSynthesisVoice[]
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true)

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        // Filter for English (US) voices, or fallback to all English voices
        const enVoices = availableVoices.filter(
          voice => voice.lang.startsWith('en-US') || voice.lang.startsWith('en')
        )
        setVoices(enVoices.length > 0 ? enVoices : availableVoices)
      }

      // Load voices immediately
      loadVoices()

      // Chrome loads voices asynchronously, so we need to listen for the event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }

      return () => {
        // Cleanup
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = null
        }
      }
    } else {
      setSupported(false)
    }
  }, [])

  const cancel = useCallback(() => {
    if (supported && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      utteranceRef.current = null
    }
  }, [supported])

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!supported || !text) {
        return
      }

      // Cancel any ongoing speech before starting new one
      cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Set speech rate
      utterance.rate = options?.rate ?? 1.0

      // Select voice
      if (options?.voice) {
        const selectedVoice = voices.find(v => v.voiceURI === options.voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      } else {
        // Default to first en-US voice if available
        const defaultVoice = voices.find(v => v.lang.startsWith('en-US'))
        if (defaultVoice) {
          utterance.voice = defaultVoice
        }
      }

      // Event handlers
      utterance.onstart = () => {
        setSpeaking(true)
      }

      utterance.onend = () => {
        setSpeaking(false)
        utteranceRef.current = null
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        setSpeaking(false)
        utteranceRef.current = null
      }

      // Store reference and speak
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [supported, voices, cancel]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    speak,
    cancel,
    speaking,
    supported,
    voices,
  }
}
