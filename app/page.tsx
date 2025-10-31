'use client'

import { useState } from 'react'

interface EmailStep {
  subject: string
  content: string
  delayDays: number
}

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [listId, setListId] = useState('')
  const [flowName, setFlowName] = useState('')
  const [emailSteps, setEmailSteps] = useState<EmailStep[]>([
    { subject: '', content: '', delayDays: 0 }
  ])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const addEmailStep = () => {
    setEmailSteps([...emailSteps, { subject: '', content: '', delayDays: 0 }])
  }

  const removeEmailStep = (index: number) => {
    setEmailSteps(emailSteps.filter((_, i) => i !== index))
  }

  const updateEmailStep = (index: number, field: keyof EmailStep, value: string | number) => {
    const updated = [...emailSteps]
    updated[index] = { ...updated[index], [field]: value }
    setEmailSteps(updated)
  }

  const createSequence = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Creating email sequence...')

    try {
      const response = await fetch('/api/create-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          listId,
          flowName,
          emailSteps
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(`✅ Success! Flow created with ID: ${data.flowId}`)
      } else {
        setStatus(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '32px',
          marginBottom: '10px',
          color: '#333',
          textAlign: 'center'
        }}>
          📧 Klaviyo Email Sequence Creator
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '30px'
        }}>
          Create automated email flows in your Klaviyo account
        </p>

        <form onSubmit={createSequence}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Klaviyo Private API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="pk_xxxxxxxxxxxxxxxxxxxxx"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Flow Name
            </label>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Welcome Series"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              List ID (optional)
            </label>
            <input
              type="text"
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              placeholder="ABC123"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <label style={{
                fontWeight: '600',
                color: '#333',
                fontSize: '18px'
              }}>
                Email Steps
              </label>
              <button
                type="button"
                onClick={addEmailStep}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                + Add Email
              </button>
            </div>

            {emailSteps.map((step, index) => (
              <div
                key={index}
                style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '2px solid #e9ecef'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#495057'
                  }}>
                    Email {index + 1}
                  </h3>
                  {emailSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailStep(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    Delay (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={step.delayDays}
                    onChange={(e) => updateEmailStep(index, 'delayDays', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={step.subject}
                    onChange={(e) => updateEmailStep(index, 'subject', e.target.value)}
                    placeholder="Welcome to our newsletter!"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    Email Content (HTML)
                  </label>
                  <textarea
                    value={step.content}
                    onChange={(e) => updateEmailStep(index, 'content', e.target.value)}
                    placeholder="<h1>Welcome!</h1><p>Thanks for joining us...</p>"
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            {loading ? 'Creating...' : '🚀 Create Email Sequence'}
          </button>
        </form>

        {status && (
          <div style={{
            marginTop: '25px',
            padding: '15px',
            background: status.includes('✅') ? '#d4edda' : '#f8d7da',
            border: `2px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '8px',
            color: status.includes('✅') ? '#155724' : '#721c24',
            fontSize: '14px'
          }}>
            {status}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>📝 Note:</strong> This creates a flow in Klaviyo using their API. You'll need:
          <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
            <li>A Klaviyo Private API Key (get from Account → Settings → API Keys)</li>
            <li>The flow will be created in draft status</li>
            <li>You'll need to activate it manually in Klaviyo after creation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
