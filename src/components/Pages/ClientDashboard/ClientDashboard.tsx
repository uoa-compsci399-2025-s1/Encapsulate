'use client'
import type { StatusCodes } from 'http-status-codes'

import CreateProjectCard from '@/components/Composite/CreateProjectCard/CreateProjectCard'
import GradientTextArea from '@/components/Generic/GradientTextArea/GradientTextArea'
import ClientProfile from '@/components/Composite/ClientProfile/ClientProfile'
import ProjectCardList from '@/components/Composite/ProjectCardList/ProjectCardList'
import type { UserCombinedInfo } from '@/types/Collections'
import type { ClientDashboard } from '@/payload-types'
import type { ProjectDetails } from '@/types/Project'
import type { UseQueryResult } from '@tanstack/react-query'

interface ClientDashboardProps {
  client: UserCombinedInfo
  content: ClientDashboard
  onSave?: (
    firstName: string,
    lastName: string,
    affiliation: string,
    introduction: string,
  ) => Promise<{
    updatedUser: UserCombinedInfo
    status: StatusCodes
    error?: string
    details?: string
  }>
  onDeleteProject: (projectId: string) => Promise<{
    error?: string
    message?: string
  }>
  useClientPage: () => UseQueryResult<ProjectDetails[], Error>
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  content,
  onSave,
  onDeleteProject,
  useClientPage,
}) => {
  const { data: projects, isLoading } = useClientPage()

  if (isLoading) {
    return <div className="text-center text-dark-blue text-lg pt-30">Loading...</div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 xl:grid-cols-2 xl:grid-rows-[auto_1fr] gap-20 sm:gap-16 xl:gap-10 pb-12 items-stretch">
        <CreateProjectCard />
        <div className="row-start-2 -ml-5">
          <GradientTextArea heading={content.tipTitle} text={content.tipContent} />
        </div>
        <div className="xl:col-start-2 xl:row-span-2">
          <ClientProfile clientInfo={client} onSave={onSave} />
        </div>
      </div>
      <ProjectCardList
        className="bg-muted-blue-op-45 px-6 pt-6 pb-9 sm:px-7 lg:px-15 lg:pt-8 sm:pb-12 rounded-2xl border-deeper-blue border"
        headingClassName="text-xl sm:text-2xl py-4 sm:py-6"
        heading="My projects"
        projects={projects || []}
        type="client"
        onDelete={onDeleteProject}
      />
    </div>
  )
}

export default ClientDashboard
