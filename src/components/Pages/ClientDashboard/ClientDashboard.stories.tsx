import type { Meta, StoryObj } from '@storybook/react'

import ClientDashboard from './ClientDashboard'
import { mockClients } from '@/test-config/mocks/User.mock'
import clientDashboardContent from '@/lib/defaults/ClientDashboard'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ProjectDetails } from '@/types/Project'

const meta: Meta<typeof ClientDashboard> = {
  title: 'Pages/ClientDashboard',
  component: ClientDashboard,
  tags: ['autodocs'],
  args: {
    client: mockClients[0],
  },
}

export default meta

type Story = StoryObj<typeof ClientDashboard>

export const Default: Story = {
  render: function RenderClientDashboard(args) {
    return (
      <div className="bg-beige p-15">
        <ClientDashboard {...args} />
      </div>
    )
  },
  args: {
    client: mockClients[0],
    content: clientDashboardContent,
    useClientPage: () => {
      return { data: [], isLoading: false } as unknown as UseQueryResult<ProjectDetails[], Error>
    },
  },
}
