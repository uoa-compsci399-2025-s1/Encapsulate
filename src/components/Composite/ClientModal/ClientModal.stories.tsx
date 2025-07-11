import type { Meta, StoryObj } from '@storybook/react'
import { useArgs } from '@storybook/preview-api'
import ClientModal from './ClientModal'
import Button from '@/components/Generic/Button/Button'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ProjectDetails } from '@/types/Project'
import { QueryClientDecorator } from '@/utils/storybookProvider'

const meta: Meta<typeof ClientModal> = {
  title: 'Composite/ClientModal',
  component: ClientModal,
  tags: ['autodocs'],
  args: {
    open: false,
    className: '',
  },
  decorators: [QueryClientDecorator],
}

export default meta
type Story = StoryObj<typeof ClientModal>

export const Exemplar: Story = {
  render: function RenderClientModal(args) {
    const [{ open }, updateArgs] = useArgs()

    function onChange() {
      updateArgs({ open: !open })
    }

    return (
      <div>
        <Button onClick={() => onChange()} variant="dark" size="md">
          Open modal
        </Button>
        <ClientModal {...args} open={open} onClose={() => onChange()}>
          <p className="text-black">This is a default modal.</p>
        </ClientModal>
      </div>
    )
  },
  args: {
    open: false,
    className: '',
    clientInfo: {
      firstName: 'John',
      lastName: 'Doe',
      affiliation: 'University of Auckland',
      introduction:
        'Hello! My name is John Doe and I am a lecturer at the University of Auckland. \n\nMy hobbies include snorkelling, fishing, reading, baking, eating, sleeping and taking various methods of transport to my destination!\n\n"John Doe" is a common placeholder name used to represent an unknown or anonymous individual, particularly in legal or informal contexts. It\'s often used as a stand-in when a person\'s real name is not known, needs to be protected, or when a general example is needed. The female equivalent is "Jane Doe".',
      id: '123',
      email: 'johndoe@gmail.com',
      role: 'client',
      updatedAt: '123',
      createdAt: '123',
    },
    clientEmail: 'johndoe@gmail.com',
    useClientProjects: (id: string) => {
      console.log(`Client projects fetch called on ID: ${id}`)
      return {} as unknown as UseQueryResult<ProjectDetails[], Error>
    },
  },
}
