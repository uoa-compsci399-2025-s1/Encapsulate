'use client'

import React, { useState, useRef } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import Button from '@/components/Generic/Button/Button'
import Input from '@/components/Generic/Input/InputField'
import Textarea from '@/components/Generic/Textarea/Textarea'
import Radio from '@/components/Generic/Radio/Radio'
import type { CheckboxOptions } from '@/components/Generic/Checkbox/Checkbox'
import Checkbox from '@/components/Generic/Checkbox/Checkbox'
import { FiCheck } from 'react-icons/fi'
import { HiX, HiExclamation } from 'react-icons/hi'
import { redirect, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { CreateProjectRequestBody, CreateProjectClient } from '@/app/api/projects/route'
import type { ProjectDetails } from '@/types/Project'
import { handleProjectFormSubmission, handleProjectUpdate } from '@/lib/services/form/Handlers'
import Notification from '@/components/Generic/Notification/Notification'
import type { Semester } from '@/payload-types'
import type { UpdateProjectRequestBody } from '@/app/api/projects/[id]/route'
import { useQueryClient } from '@tanstack/react-query'
interface FormProject extends CreateProjectRequestBody {
  meetingAttendance: boolean
  finalPresentationAttendance: boolean
  projectSupportAndMaintenance: boolean
}

const returnSubmissionDateFromISOString = (isoString: string): string => {
  const date = new Date(isoString)
  // want to subtract 1 minute from the date to ensure people submit by 11:59pm the previous day
  date.setMinutes(date.getMinutes() - 1)
  return date.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

type FormViewProps = {
  projectData?: ProjectDetails
  upcomingSemesters: Semester[]
  disabled?: boolean
}

const FormView: FC<FormViewProps> = ({ projectData, upcomingSemesters }) => {
  const [showNotification, setShowNotification] = useState<boolean>(false)

  // id / semester name pairs for the upcoming semesters
  const [upcomingSemesterOptions, setUpcomingSemesterOptions] = useState<CheckboxOptions[]>([])
  const [nextSemesterDetails, setNextSemesterDetails] = useState<Semester>()

  // State to manage the additional client details
  const [otherClientDetails, setOtherClientDetails] = useState<CreateProjectClient[]>([])

  const [submitState, setSubmitState] = useState<boolean>(false)

  // State to manage the pairs of names and emails of additional clients
  const searchParams = useSearchParams()
  const projectName = searchParams.get('projectName') || ''

  // check if trying to edit an existing project
  const projectId = searchParams.get('projectId') || undefined

  const queryClient = useQueryClient()

  const handleChange = (index: number, field: keyof CreateProjectClient, value: string) => {
    const updated = [...otherClientDetails]
    updated[index][field] = value
    setOtherClientDetails(updated)
  }

  const addPair = () => {
    setOtherClientDetails([...otherClientDetails, { firstName: '', lastName: '', email: '' }])
  }

  const deletePair = (index: number) => {
    setOtherClientDetails(otherClientDetails.filter((_, i) => i !== index))
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormProject>()

  const hasInitialized = useRef({ semester: false, project: false })

  if (!hasInitialized.current.semester) {
    //sets upcoming semester options from earliest -> latest
    setUpcomingSemesterOptions(
      upcomingSemesters
        // make sure to filter out semesters whose deadline has passed
        .filter((semester) => new Date() < new Date(semester.deadline))
        .map((semester) => ({
          value: semester.id,
          label: `${semester.name} (${returnSubmissionDateFromISOString(semester.startDate)} - ${returnSubmissionDateFromISOString(semester.endDate)})`,
        }))
        .reverse(),
    )
    // the closest upcoming semester is the last one in the list
    setNextSemesterDetails(
      upcomingSemesters.length > 0
        ? upcomingSemesters.filter((semester) => new Date() < new Date(semester.deadline)).at(-1)
        : undefined,
    )

    hasInitialized.current.semester = true
  }

  if (projectData && projectId && !hasInitialized.current.project) {
    // filling out the additional clients
    if (projectData.additionalClients) {
      const clients = projectData.additionalClients
        // since clients is type User | string[], we need to filter out strings
        .filter((client) => typeof client !== 'string')
        .map((client) => ({
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          email: client.email || '',
        }))
      setOtherClientDetails(clients)
    }

    // If projectData is provided, set the form values to the project data
    setValue('name', projectData.name || '')
    setValue('description', projectData.description || '')
    setValue('desiredOutput', projectData.desiredOutput || '')
    setValue('specialEquipmentRequirements', projectData.specialEquipmentRequirements)
    setValue('numberOfTeams', projectData.numberOfTeams)
    setValue('desiredTeamSkills', projectData.desiredTeamSkills || '')
    setValue('availableResources', projectData.availableResources || '')

    setValue('meetingAttendance', true)
    setValue('finalPresentationAttendance', true)
    setValue('projectSupportAndMaintenance', true)

    const semesterIds = (projectData.semesters || []).map((sem) => sem.id)
    setValue('semesters', semesterIds || [])

    // sets upcoming semester options from earliest -> latest
    setUpcomingSemesterOptions(
      upcomingSemesters
        .map((semester) => ({
          value: semester.id,
          label: `${semester.name} (${returnSubmissionDateFromISOString(semester.startDate)} - ${returnSubmissionDateFromISOString(semester.endDate)})`,
          disabled: semesterIds.includes(semester.id),
        }))
        .reverse(),
    )

    hasInitialized.current.project = true
  }

  const submitProject: SubmitHandler<FormProject> = async (data) => {
    setSubmitState(true)
    data.additionalClients = otherClientDetails

    const {
      meetingAttendance: _meetingAttendance,
      finalPresentationAttendance: _finalPresentationAttendance,
      projectSupportAndMaintenance: _projectSupportAndMaintenance,
      // Exclude these fields from the cleaned data
      ...cleanedData
    } = data

    const res = await handleProjectFormSubmission(cleanedData as CreateProjectRequestBody)

    // Handle the response as needed
    // For example, you can check for errors or success messages
    if (res?.success) {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['semesterProjects'] })
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] })
      queryClient.invalidateQueries({ queryKey: ['clientPage'] })
      queryClient.invalidateQueries({ queryKey: ['studentPage'] })
      redirect('/client')
    } else {
      console.error('Error submitting form:', res?.error)
      setShowNotification(true)
      setSubmitState(false)
    }
  }

  const editProject: SubmitHandler<FormProject> = async (data) => {
    if (!projectId) {
      console.error('Project ID is required for editing')
      return
    }
    setSubmitState(true)
    data.additionalClients = otherClientDetails

    const {
      meetingAttendance: _meetingAttendance,
      finalPresentationAttendance: _finalPresentationAttendance,
      projectSupportAndMaintenance: _projectSupportAndMaintenance,
      ...cleanedData
    } = data

    const res = await handleProjectUpdate(projectId, cleanedData as UpdateProjectRequestBody)

    if (res?.success) {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['semesterProjects'] })
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] })
      queryClient.invalidateQueries({ queryKey: ['clientPage'] })
      queryClient.invalidateQueries({ queryKey: ['studentPage'] })
      redirect('/client')
    } else {
      console.error('Error submitting form:', res?.error)
      setShowNotification(true)
    }
    setSubmitState(false)
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-[#779ea7] to-[#dae6e2] flex flex-col items-center overflow-y-scroll py-[8%] gap-4">
      <div className="fixed top-6 right-6 z-50">
        <Notification
          isVisible={showNotification}
          title={'Issue submitting form'}
          message={'Please check the form for errors and try again.'}
          type={'warning'}
          onClose={() => {
            setShowNotification(false)
          }}
        />
      </div>
      <div className="relative bg-light-beige w-[95%] sm:w-[85%] md:w-[75%] flex flex-col rounded-2xl my-auto border border-deeper-blue">
        <div className="relative flex flex-col px-10 pb-10 pt-15 md:px-15 md:pb-15 md:pt-20 rounded-t-2xl gap-6">
          <Link href="/client">
            <button
              className="absolute top-10 right-10 rounded-full hover:cursor-pointer"
              onClick={() => {}}
            >
              <HiX className="w-5 h-5 text-dark-blue hover:text-steel-blue" />
            </button>
          </Link>
          <h1 className="text-4xl font-normal m-0 text-dark-blue font-dm-serif-display mb-3">
            {projectId
              ? 'Edit Project Proposal'
              : 'Computer Science Capstone: Project Proposal Form'}
          </h1>
          <div className={projectId ? 'hidden' : ''}>
            <h2 className="text-dark-blue font-inter font-bold text-lg whitespace-pre-wrap pb-2">
              Deadline
            </h2>
            <p className="text-dark-blue font-inter text-sm">
              Please complete this form if you wish to propose a project for the COMPSCI 399
              Capstone Course in <b>{nextSemesterDetails?.name}</b>. The deadline for form
              submission is{' '}
              <b>
                {returnSubmissionDateFromISOString(nextSemesterDetails?.deadline ?? '')}, by 11:59
                pm
              </b>
              .
              <br />
              <br />
              <em>
                Note: We accept applications throughout the year, but if the deadline isn&apos;t
                met, we will consider the project only for the following semester.
              </em>
            </p>
          </div>
          <div className={projectId ? 'hidden' : ''}>
            <h2 className="text-dark-blue font-inter font-bold text-lg whitespace-pre-wrap pb-2">
              Project Requirements
            </h2>
            <p className="text-dark-blue font-inter text-sm">
              The proposed project should be a research or software development project, suitable in
              size to be completed within the 12-week duration of the semester. It should present a
              challenge for a team consisting of 5-6 students. For example, if you are involved in
              an ongoing research/development project and seek assistance in developing a specific
              module, you can propose it as a potential project. Alternatively, if you are in a
              service role and require support in creating a system to facilitate or automate
              certain aspects of your work, you can suggest a project for consideration.
              <br />
              <br />
              Each team is expected to allocate approximately 7-8 hours per person per week to
              project development. The team will produce a prototype system every fortnight,
              progressively enhancing its functionality.
            </p>
          </div>
          <div className={projectId ? 'hidden' : ''}>
            <h2 className="text-dark-blue font-inter font-bold text-lg whitespace-pre-wrap pb-2">
              Supervision Requirements
            </h2>
            <p className="text-dark-blue font-inter text-sm">
              Team(s) will meet with you (or your nominated representative) at least once every
              fortnight to ensure that the project is going in the right direction. There will be a
              final project presentation session (probably in the last week of the semester) that we
              would expect you (or your nominated representative) to attend and provide us with
              feedback on your team&apos;s performance.
            </p>
          </div>
          <div className={projectId ? 'hidden' : ''}>
            <h2 className="text-dark-blue font-inter font-bold text-lg whitespace-pre-wrap pb-2">
              Disclaimer & Limitations
            </h2>
            <p className="text-dark-blue font-inter text-sm">
              Please note that the COMPSCI 399 Capstone Course is designed solely as an academic
              experience for the duration of the semester. The course does not allocate any
              resources for ongoing support or maintenance of project outcomes beyond the end of the
              semester. Any further support, maintenance, or development required post-semester must
              be arranged independently by the proposing party. Consequently, neither the university
              nor the participating students assume any liability for any issues, operational
              continuity, or further development of the project after the course concludes.
            </p>
          </div>
          <div className={projectId ? 'hidden' : ''}>
            <h2 className="text-dark-blue font-inter font-bold text-lg whitespace-pre-wrap pb-2">
              Contacts & Information
            </h2>
            <p className="text-dark-blue font-inter text-sm">
              You can find examples of projects created by capstone students following this link:{' '}
              <a
                className="text-steel-blue underline wrap-break-word"
                href="https://www.capitalise.space"
                target="_blank"
              >
                https://www.capitalise.space/
              </a>{' '}
              <br />
              The course overview can be found here:{' '}
              <a
                className="text-steel-blue underline wrap-break-word"
                href="https://courseoutline.auckland.ac.nz/dco/course/COMPSCI/399/1243"
              >
                https://courseoutline.auckland.ac.nz/dco/course/COMPSCI/399/1243
              </a>{' '}
              <br />
              <br />
              If you have any questions, please feel free to contact: <br />
              Anna Trofimova (
              <a
                className="text-steel-blue underline wrap-break-word"
                href="mailto:anna.trofimova@auckland.ac.nz"
              >
                anna.trofimova@auckland.ac.nz
              </a>
              ) <br />
              or Asma Shakil (
              <a
                className="text-steel-blue underline wrap-break-word"
                href="mailto:asma.shakil@auckland.ac.nz"
              >
                asma.shakil@auckland.ac.nz
              </a>
              )
            </p>
          </div>
        </div>
        <div className="relative bg-transparent-blue border-t-deeper-blue border-t max-w-full flex flex-col px-10 pt-10 md:px-15 md:pt-15 pb-20 rounded-b-2xl gap-5">
          <p className="text-dark-blue font-inter pb-6">
            <span className="text-pink-accent">*</span> Required
          </p>
          <form
            onSubmit={projectId ? handleSubmit(editProject) : handleSubmit(submitProject)}
            className="flex flex-col gap-4"
          >
            <ol className="flex flex-col gap-10 list-decimal list-inside text-dark-blue font-inter text-lg whitespace-pre-wrap">
              <li>
                <label htmlFor="OtherClientDetails">Other client&apos;s details</label>
                <div className="flex flex-wrap lg:flex-nowrap justify-between items-center">
                  <p className="form-question-subheading">
                    If there is anyone else involved in the project, please provide their names and
                    emails.
                  </p>
                  <Button
                    type="button"
                    variant="muted_blue"
                    size="sm"
                    className="self-start h-10 text-nowrap mb-7"
                    onClick={addPair}
                  >
                    + Add Client
                  </Button>
                </div>
                {otherClientDetails.map((pair, idx) => (
                  <div key={idx} className="flex flex-wrap lg:flex-nowrap gap-5 justify-end mb-5">
                    <div className="w-full lg:w-80 flex flex-col gap-3">
                      <label className="text-sm">First Name:</label>
                      <Input
                        id={`OtherClientFirstName${idx}`}
                        type="text"
                        value={pair.firstName}
                        onChange={(e) => handleChange(idx, 'firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div className="w-full lg:w-80 flex flex-col gap-3">
                      <label className="text-sm">Last Name:</label>
                      <Input
                        id={`OtherClientLastName${idx}`}
                        type="text"
                        value={pair.lastName}
                        onChange={(e) => handleChange(idx, 'lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div className="w-full flex flex-col gap-3">
                      <label className="text-sm">Email:</label>
                      <Input
                        id={`OtherClientEmail${idx}`}
                        type="email"
                        value={pair.email}
                        onChange={(e) => handleChange(idx, 'email', e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="dark"
                      size="md"
                      className="ml-10 self-end h-10"
                      onClick={() => deletePair(idx)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </li>
              <li>
                <label htmlFor="ProjectTitle">
                  Project title <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  Please provide an informative project title.
                </p>
                <Input
                  id="ProjectTitle"
                  type="text"
                  placeholder="Enter the project title"
                  defaultValue={projectName}
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
                  {...register('name', { required: 'Project title is required' })}
                />
              </li>
              <li>
                <label htmlFor="ProjectDescription">
                  Project description <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  Please provide a short description (3-10 sentences) of the project.
                </p>
                <Textarea
                  id="Description"
                  placeholder="Enter the project description"
                  className="h-25"
                  error={!!errors.description}
                  errorMessage={errors.description?.message}
                  {...register('description', { required: 'Project description is required' })}
                />
              </li>
              <li>
                <label htmlFor="DesiredOutput">
                  Desired output <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  Please identify the features that will constitute the MVP (minimum viable
                  product).
                </p>
                <Textarea
                  id="DesiredOutput"
                  placeholder="Enter the desired output"
                  className="h-25"
                  error={!!errors.desiredOutput}
                  errorMessage={errors.desiredOutput?.message}
                  {...register('desiredOutput', { required: 'Desired output is required' })}
                />
              </li>
              <li>
                <label htmlFor="SpecialEquipmentRequirements">
                  Special equipment requirements <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  Will your project require special equipment that you are unable to provide? If
                  yes, please specify the required equipment. Note: We can only accept a limited
                  number of projects with special equipment needs.
                </p>
                <Radio
                  values={['No']}
                  customInput={true}
                  error={!!errors.specialEquipmentRequirements}
                  errorMessage={errors.specialEquipmentRequirements?.message}
                  defaultValue={projectData?.specialEquipmentRequirements ?? ''}
                  registration={register('specialEquipmentRequirements', {
                    required: 'Please select one option',
                    validate: (value) => value !== '' || 'Input field must not be empty',
                  })}
                />
              </li>
              <li>
                <label htmlFor="SpecialEquipmentRequirements">
                  Number of teams <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  Would you be open to the idea of <b>multiple teams working on your project</b>? If
                  yes, please specify the maximum number of teams you would be happy to work with.
                  To make it easier for you, all team meetings will be combined into the same time
                  slot, ensuring you won&apos;t need to allocate more meeting time than you would
                  with one team.
                  <br />
                  <br />
                  For your consideration, 1-4 teams would require a 1-hour meeting fortnightly.
                  Additionally, we will invite you to evaluate teams&apos; final presentations,
                  typically taking about 20 minutes per team.Working with multiple teams offers the
                  advantage of bringing diverse perspectives and ideas to the project.
                  <br />
                  <br />
                  It also increases the likelihood of achieving a final result that aligns with
                  expectations.
                </p>
                <Radio
                  values={['No, only 1 team', 'Yes, up to 4 teams']}
                  customInput={true}
                  error={!!errors.numberOfTeams}
                  errorMessage={errors.numberOfTeams?.message}
                  defaultValue={projectData?.numberOfTeams ?? ''}
                  registration={register('numberOfTeams', {
                    required: 'Number of teams is required',
                    validate: (value) => value !== '' || 'Number of teams is required',
                  })}
                />
              </li>
              <li>
                <label htmlFor="DesiredTeamSkills">Desired team skills</label>
                <p className="form-question-subheading">
                  Please specify any skills you would like team members to have. This could include
                  expertise in a specific technology or tool that you want the team to use for
                  implementing the project.
                </p>
                <Textarea
                  id="DesiredTeamSkills"
                  placeholder="Enter any desired team skills"
                  className="h-25"
                  {...register('desiredTeamSkills')}
                />
              </li>
              <li>
                <label htmlFor="AvailableResources">Available resources</label>
                <p className="form-question-subheading">
                  Are there any resources you would like to provide for students to become more
                  familiar with your project?
                </p>
                <Textarea
                  id="AvailableResources"
                  placeholder="Enter any available resources"
                  className="h-25"
                  {...register('availableResources')}
                />
              </li>
              <li>
                <label htmlFor="FutureSemesters">
                  Semester Availability <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  Please select all the semesters you would like your project to be considered for.
                </p>
                <Checkbox
                  options={upcomingSemesterOptions}
                  error={!!errors.semesters}
                  errorMessage={errors.semesters?.message}
                  {...register('semesters', {
                    required: 'Please select at least one semester',
                  })}
                />
                {projectData && projectId ? (
                  <p className="form-question-subheading">
                    <br />
                    <b>Note:</b> semesters that are greyed out have already been selected and{' '}
                    <b>cannot be removed directly</b>.
                    <br />
                    If you would like to remove a semester, please contact the course coordinators.
                  </p>
                ) : null}
              </li>
              <li>
                <label htmlFor="MeetingAttendance">
                  Meeting attendance <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  The teaching team will aim to arrange meetings with the students at times that
                  best suit your schedule. You can attend the meetings either in person or via Zoom
                  (or Teams). The details and schedule of the meetings will be arranged at the
                  beginning of the semester and will cover the entire duration of the course.
                </p>
                <label className="flex mb-3">
                  <input
                    type="checkbox"
                    style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                    className="opacity-0 peer"
                    {...register('meetingAttendance', {
                      required: 'Meeting attendance is required',
                    })}
                  />
                  <span
                    className={`${!!errors.finalPresentationAttendance ? 'border-pink-accent hover:outline-dark-pink peer-focus:outline-dark-pink' : 'border-steel-blue hover:outline-deeper-blue peer-focus:outline-deeper-blue'}
                        min-w-[16px] h-[16px] flex mt-[3px] mr-6 border-[1.5px] rounded-sm
                        peer-checked:bg-steel-blue
                        [&>*]:opacity-0 peer-checked:[&>*]:opacity-100
                        hover:outline
                        peer-focus:outline
                        transition-colors duration-150`}
                  >
                    <FiCheck className="stroke-4 w-[12px] h-[12px] text-white self-center m-auto" />
                  </span>
                  <p className="text-sm text-dark-blue">
                    I confirm that I will be able to attend <b>6 meetings</b> with students,
                    scheduled 2-3 weeks apart.
                  </p>
                </label>
                {!!errors.meetingAttendance && (
                  <div className="flex items-center gap-2 text-xs text-pink-accent min-h-[1.25rem] mt-2">
                    <HiExclamation className="w-3 h-3" />
                    <p>{errors.meetingAttendance?.message}</p>
                  </div>
                )}
              </li>
              <li>
                <label htmlFor="FinalPresentationAttendance">
                  Final presentation attendance <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  The teaching team will aim to arrange the final presentation at a time that best
                  suits your schedule. The final presentation will be held on the UoA Main Campus
                  and must be attended in person.
                </p>
                <label className="flex mb-3">
                  <input
                    type="checkbox"
                    style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                    className="opacity-0 peer"
                    {...register('finalPresentationAttendance', {
                      required: 'Final presentation attendance is required',
                    })}
                  />
                  <span
                    className={`${!!errors.finalPresentationAttendance ? 'border-pink-accent hover:outline-dark-pink peer-focus:outline-dark-pink' : 'border-steel-blue hover:outline-deeper-blue peer-focus:outline-deeper-blue'}
                        min-w-[16px] h-[16px] flex mt-[3px] mr-6 border-[1.5px] rounded-sm
                        peer-checked:bg-steel-blue
                        [&>*]:opacity-0 peer-checked:[&>*]:opacity-100
                        hover:outline
                        peer-focus:outline
                        transition-colors duration-150`}
                  >
                    <FiCheck className="stroke-4 w-[12px] h-[12px] text-white self-center m-auto" />
                  </span>
                  <p className="text-sm text-dark-blue">
                    I confirm that I will be able to attend final presentation <b>in-person</b>.
                  </p>
                </label>
                {!!errors.finalPresentationAttendance && (
                  <div className="flex items-center gap-2 text-xs text-pink-accent min-h-[1.25rem] mt-2">
                    <HiExclamation className="we3 h-3" />
                    <p>{errors.finalPresentationAttendance?.message}</p>
                  </div>
                )}
              </li>
              <li>
                <label htmlFor="ProjectSupportAndMaintenance">
                  Project Support and Maintenance <span className="text-pink-accent">*</span>
                </label>
                <p className="form-question-subheading">
                  The COMPSCI 399 Capstone Course is provided solely for academic purposes during
                  the semester.
                </p>
                <label className="flex mb-3">
                  <input
                    name="ProjectSupportAndMaintenance"
                    type="checkbox"
                    style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                    className="opacity-0 peer"
                    required={false}
                  />
                  <Checkbox
                    options={[
                      {
                        label:
                          'I understand that no resources will be available for support or maintenance after the semester ends, and that neither the University nor the participating students assume any liability for the project outcome.',
                        value: 'yes',
                      },
                    ]}
                    error={!!errors.projectSupportAndMaintenance}
                    errorMessage={errors.projectSupportAndMaintenance?.message}
                    {...register('projectSupportAndMaintenance', {
                      required: 'Project support and maintenance is required',
                    })}
                  />
                </label>
              </li>
            </ol>
            <Button
              type="submit"
              variant="dark"
              size="sm"
              loading={submitState}
              className="self-start mt-5 ml-4 h-10 w-32"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default FormView
