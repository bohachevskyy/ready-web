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

// High-quality voices whitelist (conservative approach)
const ALLOWED_VOICES = [
  'Samantha',
  'Daniel',
  'Microsoft David',
  'Microsoft Zira',
  'Google US English',
  'Google UK English Female',
  'Google UK English Male'
]

function isAllowedVoice(voice: SpeechSynthesisVoice): boolean {
  // Allow explicitly whitelisted voices
  if (ALLOWED_VOICES.some(allowed => voice.name.includes(allowed))) {
    return true
  }
  // Allow all Google cloud voices
  if (voice.name.startsWith('Google')) {
    return true
  }
  return false
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
        // Filter for English voices only - prioritize en-US, then en-GB, then other English
        // Only include whitelisted high-quality voices
        const enUSVoices = availableVoices
          .filter(v => v.lang.startsWith('en-US'))
          .filter(v => isAllowedVoice(v))
        const enGBVoices = availableVoices
          .filter(v => v.lang.startsWith('en-GB'))
          .filter(v => isAllowedVoice(v))
        const enOtherVoices = availableVoices
          .filter(v => v.lang.startsWith('en') && !v.lang.startsWith('en-US') && !v.lang.startsWith('en-GB'))
          .filter(v => isAllowedVoice(v))
        const englishVoices = [...enUSVoices, ...enGBVoices, ...enOtherVoices]

        // Only store English voices - speak() function handles fallback if empty
        setVoices(englishVoices)
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
      utterance.pitch = 1.0;
      
      // IMPORTANT: Always set language to English to prevent using system locale
      // This ensures pronunciation is in English even if no English voice is found
      utterance.lang = 'en-US'

      // Get all available voices (fresh fetch to handle async loading)
      const allVoices = window.speechSynthesis.getVoices()
      console.log(allVoices.filter(v => v.lang.startsWith('en')).map(v => v.voiceURI))

      // Filter for English voices with priority: en-US > en-GB > any en-*
      // Only include whitelisted high-quality voices
      const enUSVoices = allVoices
        .filter(v => v.lang.startsWith('en-US'))
        .filter(v => isAllowedVoice(v))
      const enGBVoices = allVoices
        .filter(v => v.lang.startsWith('en-GB'))
        .filter(v => isAllowedVoice(v))
      const enOtherVoices = allVoices
        .filter(v => v.lang.startsWith('en') && !v.lang.startsWith('en-US') && !v.lang.startsWith('en-GB'))
        .filter(v => isAllowedVoice(v))
      const englishVoices = [...enUSVoices, ...enGBVoices, ...enOtherVoices]

      // Priority 1: If no voice set yet, use first available English voice
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0]
      } else if (options?.voice) {
        // Priority 2: Use user-selected voice if it exists
        const selectedVoice = allVoices.find(v => v.voiceURI === options.voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }
      // Priority 3: If still no voice, let browser use default with lang=en-US hint

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

      // Chrome bug workaround: resume synthesis if it got paused
      // This is a known Chrome issue where speechSynthesis gets stuck after ~15s or when tab is backgrounded
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
      
      window.speechSynthesis.speak(utterance)
    },
    [supported, cancel]
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
