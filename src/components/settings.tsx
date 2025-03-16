'use client'

import React, {
  useEffect,
  useState,
} from 'react';

import { IconX } from './icons';

interface ModelOption {
  id: string
  name: string
}

interface ModelType {
  id: string
  name: string
  options: ModelOption[]
}

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: SettingsData) => void
  initialSettings: SettingsData
}

export interface SettingsData {
  modelType: string
  model: string
  apiUrl: string
  apiKey: string
}

const modelTypes: ModelType[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    options: [
      { id: 'llama3', name: 'Llama 3' },
      { id: 'llama2', name: 'Llama 2' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'gemma', name: 'Gemma' },
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    options: [
      { id: 'deepseek-r1:7b', name: 'DeepSeek R1 7B' },
      { id: 'deepseek-r1:14b', name: 'DeepSeek R1 14B' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    options: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ]
  }
]

const Settings = ({ isOpen, onClose, onSave, initialSettings }: SettingsProps) => {
  const [settings, setSettings] = useState<SettingsData>(initialSettings)
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([])

  // 当模型类型改变时，更新可用模型列表
  useEffect(() => {
    const selectedType = modelTypes.find(type => type.id === settings.modelType)
    if (selectedType) {
      setAvailableModels(selectedType.options)
      
      // 如果当前选择的模型不在新的可用模型列表中，则选择第一个可用模型
      if (!selectedType.options.some(option => option.id === settings.model) && selectedType.options.length > 0) {
        setSettings(prev => ({ ...prev, model: selectedType.options[0].id }))
      }
    } else {
      setAvailableModels([])
    }
  }, [settings.modelType, settings.model])

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-[rgba(0,0,0,.5)]  z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-lg p-6 animate-fade-in"
        style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--card-border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>设置</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 模型类型选择 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              模型类型
            </label>
            <select
              value={settings.modelType}
              onChange={e => setSettings({ ...settings, modelType: e.target.value })}
              className="w-full p-3 rounded-md"
              style={{ 
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            >
              {modelTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* 具体模型选择 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              模型
            </label>
            <select
              value={settings.model}
              onChange={e => setSettings({ ...settings, model: e.target.value })}
              className="w-full p-3 rounded-md"
              style={{ 
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* API URL 设置 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              API URL
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={e => setSettings({ ...settings, apiUrl: e.target.value })}
              placeholder="例如: http://localhost:11434/api"
              className="w-full p-3 rounded-md"
              style={{ 
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* API Key 设置 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="如果需要的话"
              className="w-full p-3 rounded-md"
              style={{ 
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md"
            style={{ 
              backgroundColor: 'var(--muted)',
              color: 'var(--muted-foreground)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
