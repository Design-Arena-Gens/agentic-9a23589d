import { NextRequest, NextResponse } from 'next/server'

interface EmailStep {
  subject: string
  content: string
  delayDays: number
}

interface RequestBody {
  apiKey: string
  listId?: string
  flowName: string
  emailSteps: EmailStep[]
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { apiKey, listId, flowName, emailSteps } = body

    if (!apiKey || !flowName || !emailSteps || emailSteps.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Create the flow
    const flowResponse = await fetch('https://a.klaviyo.com/api/flows/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'flow',
          attributes: {
            name: flowName,
            status: 'draft',
            trigger_type: 'List',
          }
        }
      })
    })

    if (!flowResponse.ok) {
      const errorText = await flowResponse.text()
      return NextResponse.json(
        { error: `Failed to create flow: ${errorText}` },
        { status: flowResponse.status }
      )
    }

    const flowData = await flowResponse.json()
    const flowId = flowData.data.id

    // Step 2: Create flow actions (emails) for each step
    const actionIds: string[] = []

    for (let i = 0; i < emailSteps.length; i++) {
      const step = emailSteps[i]

      // Create action (email)
      const actionResponse = await fetch('https://a.klaviyo.com/api/flow-actions/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'revision': '2024-10-15',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'flow-action',
            attributes: {
              action_type: 'email',
              status: 'draft',
              settings: {
                subject: step.subject,
                from_email: '{{ organization.primary_email }}',
                from_label: '{{ organization.name }}',
              },
              tracking_options: {
                is_tracking_opens: true,
                is_tracking_clicks: true,
              }
            },
            relationships: {
              flow: {
                data: {
                  type: 'flow',
                  id: flowId
                }
              }
            }
          }
        })
      })

      if (!actionResponse.ok) {
        const errorText = await actionResponse.text()
        console.error(`Failed to create action ${i + 1}:`, errorText)
        continue
      }

      const actionData = await actionResponse.json()
      const actionId = actionData.data.id
      actionIds.push(actionId)

      // Create message template for the action
      const templateResponse = await fetch('https://a.klaviyo.com/api/templates/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'revision': '2024-10-15',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'template',
            attributes: {
              name: `${flowName} - Email ${i + 1}`,
              html: step.content,
              text: step.content.replace(/<[^>]*>/g, ''), // Simple HTML to text conversion
            }
          }
        })
      })

      if (templateResponse.ok) {
        const templateData = await templateResponse.json()
        const templateId = templateData.data.id

        // Update action with template
        await fetch(`https://a.klaviyo.com/api/flow-actions/${actionId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Klaviyo-API-Key ${apiKey}`,
            'revision': '2024-10-15',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              type: 'flow-action',
              id: actionId,
              relationships: {
                'flow-messages': {
                  data: [{
                    type: 'flow-message',
                    id: templateId
                  }]
                }
              }
            }
          })
        })
      }

      // Add delay if not the first email
      if (i > 0 && step.delayDays > 0) {
        await fetch('https://a.klaviyo.com/api/flow-actions/', {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${apiKey}`,
            'revision': '2024-10-15',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              type: 'flow-action',
              attributes: {
                action_type: 'time_delay',
                status: 'live',
                settings: {
                  delay: step.delayDays,
                  delay_unit: 'days'
                }
              },
              relationships: {
                flow: {
                  data: {
                    type: 'flow',
                    id: flowId
                  }
                }
              }
            }
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      flowId,
      actionIds,
      message: `Flow "${flowName}" created successfully with ${emailSteps.length} email(s)`
    })

  } catch (error) {
    console.error('Error creating sequence:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
