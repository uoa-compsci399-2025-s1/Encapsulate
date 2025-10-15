'use client'

import React, { useState } from 'react'
import Modal from '@/components/Generic/Modal/Modal'
import Capsule from '@/components/Generic/Capsule/Capsule'
import type { ModalProps } from '@/components/Generic/Modal/Modal'
import { FiCheck, FiCopy } from 'react-icons/fi'
import Button from '@/components/Generic/Button/Button'
import EditDeleteDropdown from '@/components/Composite/EditDropdown/EditDeleteDropdown'
import type { Project, Semester } from '@/payload-types'
import type { UserCombinedInfo } from '@/types/Collections'
import { formatDate } from '@/utils/date'
import { useQueryClient } from '@tanstack/react-query'

interface ProjectModalProps extends ModalProps {
  projectInfo: Project
  semesters?: Semester[]
  type?: 'student' | 'admin' | 'client'
  onDelete?: (projectId: string) => Promise<{
    error?: string
    message?: string
  }>
  deleted?: () => void
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onClose,
  className = '',
  projectInfo,
  semesters,
  type = 'admin',
  onDelete,
  deleted,
}) => {
  const queryClient = useQueryClient()

  if (!semesters) semesters = []
  const [copied, setCopied] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  const handleCopyAll = (
    projectClientDetails: UserCombinedInfo,
    otherClientDetails: UserCombinedInfo[],
  ) => {
    const allEmails = [
      projectClientDetails.email,
      ...otherClientDetails.map((client) => client.email),
    ].join(', ')
    navigator.clipboard.writeText(allEmails)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1000)
  }

  const projectClient = projectInfo.client as UserCombinedInfo
  const otherClientDetails = projectInfo.additionalClients
    ? (projectInfo.additionalClients as UserCombinedInfo[])
    : []

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={className + ' min-h-fit w-[95%] sm:w-[85%] md:w-[75%] top-5'}
    >
      <div className="relative max-w-full flex flex-col p-15 px-5 sm:px-10 md:px-15 pt-19 rounded-t-2xl gap-5 pointer-events-none wrap-break-word">
        {/* edit button */}
        {(type === 'admin' || type === 'client') && (
          <button
            className="absolute top-8 right-16 sm:top-10 sm:right-20 text-dark-blue hover:text-steel-blue cursor-pointer"
            style={{ pointerEvents: 'initial' }}
            aria-label="Edit"
          >
            <EditDeleteDropdown
              containerWidth={200}
              onEdit={() => {
                const queryParams = new URLSearchParams({
                  projectId: projectInfo.id,
                }).toString()
                window.open(`/form?${queryParams}`)
              }}
              onDelete={async () => {
                await onDelete?.(projectInfo.id)
                deleted?.()
                await queryClient.invalidateQueries({ queryKey: ['clientPage'] })
                await queryClient.invalidateQueries({
                  queryKey: ['clientProjects', projectClient.id],
                })
                for (const client of otherClientDetails) {
                  queryClient.invalidateQueries({
                    queryKey: ['clientProjects', client.id],
                  })
                }
                onClose()
              }}
            />
          </button>
        )}

        {/* title */}
        <h1 className="text-4xl font-normal m-0 text-dark-blue font-dm-serif-display">
          {projectInfo.name}
        </h1>

        {/* client details */}
        <div className="flex flex-col md:flex-row gap-3">
          <h2 className="flex text-lg font-normal text-steel-blue font-inter">
            {projectClient?.firstName + ' ' + projectClient?.lastName}
          </h2>
          {type === 'admin' && (
            <>
              <h2 className="flex text-lg font-normal text-deeper-blue font-inter">|</h2>
              <h2 className="flex text-lg font-normal text-deeper-blue font-inter">
                {projectClient?.email}
              </h2>
              <button
                className="flex"
                style={{ pointerEvents: 'initial' }}
                onClick={() => handleCopy(projectClient?.email)}
              >
                {copied ? (
                  <FiCheck className="self-center size-5.5 text-dark-blue" />
                ) : (
                  <FiCopy className="self-center size-5.5 text-steel-blue hover:text-dark-blue cursor-pointer" />
                )}
              </button>
            </>
          )}
        </div>

        {/* project description*/}
        <p className="text-sm text-dark-blue font-inter text-left pb-3 whitespace-pre-wrap">
          {projectInfo.description}
        </p>

        {/* desired output */}
        <Capsule variant="muted_blue" text="Desired output" />
        <p className="text-sm text-dark-blue font-inter text-left mb-7 whitespace-pre-wrap">
          {projectInfo.desiredOutput}
        </p>

        {/* capsules for information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[max-content_auto] grid-flow-row gap-2.5">
          <Capsule
            className="col-start-1 col-span-2 lg:col-span-1 mr-2"
            variant="muted_blue"
            text="Special requirements"
          />
          <Capsule
            className="col-start-1 col-span-1 md:col-span-2 lg:col-start-2 mt-2 lg:mt-0 mb-5 md:mb-3"
            variant="beige"
            text={projectInfo.specialEquipmentRequirements}
          />

          <Capsule className="col-start-1" variant="muted_blue" text="Submitted" />
          <Capsule
            className="col-start-1 md:col-start-2 mb-4 md:mb-2"
            variant="gradient"
            text={formatDate(projectInfo.createdAt)}
          />

          <Capsule className="col-start-1" variant="muted_blue" text="Number of teams" />
          <Capsule
            className="col-start-1 md:col-start-2 mb-4 md:mb-2"
            variant="beige"
            text={projectInfo.numberOfTeams}
          />

          <Capsule className="col-start-1" variant="muted_blue" text="Semesters" />
          <div className="col-start-1 md:col-start-2 flex flex-row flex-wrap gap-2">
            {semesters.map((semester) => (
              <Capsule variant="beige" text={semester.name} key={semester.id} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative bg-transparent-blue max-w-full flex flex-col p-15 px-5 sm:px-10 md:px-15 pt-12 py-19 rounded-b-2xl gap-5 wrap-break-word">
        {otherClientDetails.length > 0 && type === 'student' && (
          <Capsule variant="light_beige" text="Additional Clients" />
        )}
        {otherClientDetails.length > 0 && (
          <div className="flex flex-col">
            <div
              className={`grid grid-cols-[max-content_max-content_max-content_auto_max-content] grid-rows-${otherClientDetails.length} gap-x-3 pb-3`}
            >
              {otherClientDetails.map((clientDetails) => (
                <React.Fragment key={clientDetails.email}>
                  <h2 className="col-start-1 text-lg font-normal text-dark-blue font-inter alternate">
                    {clientDetails.firstName + ' ' + clientDetails.lastName}
                  </h2>
                  {type === 'admin' && (
                    <>
                      <h2 className="col-start-2 text-lg font-normal text-deeper-blue font-inter email break-all">
                        |
                      </h2>
                      <h2 className="col-start-3 text-lg font-normal text-deeper-blue font-inter email">
                        {clientDetails.email}
                      </h2>
                    </>
                  )}
                </React.Fragment>
              ))}

              {otherClientDetails.length > 0 && type === 'admin' && (
                <Button
                  onClick={() => handleCopyAll(projectClient, otherClientDetails)}
                  className="col-start-5 row-start-1"
                  variant="muted_blue"
                  size="sm"
                >
                  {copiedAll ? <FiCheck className="self-center size-4" /> : <p>Copy All Emails</p>}
                </Button>
              )}
            </div>
          </div>
        )}
        {projectInfo.desiredTeamSkills && projectInfo.desiredTeamSkills != '' && (
          <>
            <Capsule variant="light_beige" text="Desired team skills" />
            <p className="text-sm text-dark-blue font-inter text-left mb-3 whitespace-pre-wrap">
              {projectInfo.desiredTeamSkills}
            </p>
          </>
        )}
        {projectInfo.availableResources && (
          <>
            <Capsule variant="light_beige" text="Available resources" />
            <p className="text-sm text-dark-blue font-inter text-left whitespace-pre-wrap">
              {projectInfo.availableResources}
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ProjectModal
