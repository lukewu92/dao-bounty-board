import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DUMMY_MINT_PK } from '../../../api/constants';
import { getRolesInVec, getTiersInVec } from '../../../api/utils/test-assist/bounty_board';
import { AddButton } from '../../../components/AddButton';
import { Card } from '../../../components/Card';
import { H2 } from '../../../components/H2';
import { Badge } from '../../../components/Icons/Badge';
import { Close } from '../../../components/Icons/Close';
import { Suitcase } from '../../../components/Icons/Suitcase';
import { Input } from '../../../components/Input';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Select } from '../../../components/Select';
import { Tag, TagColors } from '../../../components/Tag';
import { useBountyBoard } from '../../../hooks';
import { useRouter } from '../../../hooks/useRouter';
import { BountyTier, RoleSetting } from '../../../model/bounty-board.model';

type TagType = {
  color: TagColors
  text: string
}

const defaultTags: TagType[] = [
  {
    color: 'blue',
    text: 'Development',
  },
  {
    color: 'purple',
    text: 'Marketing',
  },
  {
    color: 'yellow',
    text: 'Sale',
  },
  {
    color: 'pink',
    text: 'Design',
  },
]

const assets = ['usdc', 'sol', 'mngo']

const FieldWrapper = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`w-[9.25rem] rounded flex items-center justify-center ${
      className || ''
    }`}
    {...rest}
  />
)

interface ICheckbox extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const Checkbox = ({ name, label, ...rest }: ICheckbox) => (
  <span className="flex items-center gap-2 text-sm">
    <input type="checkbox" id={name} name={name} {...rest} />
    <label className="text-text-secondary" htmlFor={name}>
      {label}
    </label>
  </span>
)

const labels = [
  'Task Tier',
  'Difficulty',
  'Awards',
  '',
  '',
  'Min. Requirements',
  '',
]

const dummyAddresses = [
  '2uqNsjTDsHWDMUHGPBH2dpGpUb6aUzQd6RuAddhP7PDz',
  '2uqNsjTDsHWDMUHGPBH2dpGpUb6aUzQd6RuAddhP7PDzsd',
  'asda2uqNsjTDsHWDMUHGPBH2dpGpUb6aUzQd6RuAddhP7PDz',
]

const roleLabels = ['Role', 'Permission', '', 'Members']

type FormValue = {
  tiers: BountyTier[]
  roles: RoleSetting[]
}

const defaultFormValues = {
  tiers: getTiersInVec(new PublicKey(DUMMY_MINT_PK.USDC)) as BountyTier[],
  roles: getRolesInVec() as RoleSetting[],
}

const getDefaultValues = () => {
  const val = {}

  defaultFormValues.tiers.forEach(
    ({
      tierName,
      difficultyLevel,
      minRequiredReputation,
      minRequiredSkillsPt,
      reputationReward,
      skillsPtReward,
      payoutMint,
      payoutReward,
    }) => {
      val[`tiers-${tierName}-difficultyLevel`] = difficultyLevel
      val[`tiers-${tierName}-minRequiredReputation`] = minRequiredReputation
      val[`tiers-${tierName}-minRequiredSkillsPt`] = minRequiredSkillsPt
      val[`tiers-${tierName}-reputationReward`] = reputationReward
      val[`tiers-${tierName}-skillsPtReward`] = skillsPtReward
      val[`tiers-${tierName}-payoutMint`] = payoutMint
      val[`tiers-${tierName}-payoutReward`] = payoutReward
    },
  )

  defaultFormValues.roles.forEach(
    ({ roleName, permissions, default: isDefault }) => {
      val[`roles-${roleName}-default`] = isDefault
      val[`roles-${roleName}-createBounty`] = recordExist(
        permissions,
        'createBounty',
      )
      val[`roles-${roleName}-updateBounty`] = recordExist(
        permissions,
        'updateBounty',
      )
      val[`roles-${roleName}-deleteBounty`] = recordExist(
        permissions,
        'deleteBounty',
      )
      val[`roles-${roleName}-assignBounty`] = recordExist(
        permissions,
        'assignBounty',
      )
      val[`roles-${roleName}-requestChangeToSubmission`] = recordExist(
        permissions,
        'requestChangeToSubmission',
      )
      val[`roles-${roleName}-acceptSubmission`] = recordExist(
        permissions,
        'acceptSubmission',
      )
      val[`roles-${roleName}-rejectSubmission`] = recordExist(
        permissions,
        'rejectSubmission',
      )
    },
  )

  return val
}

const recordExist = (records: any, search: string) =>
  Boolean(records.find((k) => k[search]))

interface IProposeBountyBoard {
  realmId: PublicKey
}

export const ProposeBountyBoard = ({ realmId }: IProposeBountyBoard) => {
  const { symbol, push } = useRouter()
  const [tiers, setTiers] = useState<BountyTier[]>(defaultFormValues.tiers)
  const [roles, setRoles] = useState<RoleSetting[]>(defaultFormValues.roles)
  const [members, setMembers] = useState<any>({})
  // const [confirming, setConfirming] = useState(false)
  const [confirmedValues, setConfirmedValues] = useState<any>(undefined)
  const confirming = Boolean(confirmedValues)

  const { proposeInitBountyBoard } = useBountyBoard(realmId)

  const [tags, setTags] = useState<TagType[]>(defaultTags)

  const addMember = ({
    roleName,
    address,
  }: {
    roleName: string
    address: string
  }) => {
    const memberValues = [...(members?.[roleName] || []), address]
    setMembers((prev) => ({
      ...prev,
      [roleName]: memberValues,
    }))
  }

  const removeMember = ({
    roleName,
    address,
  }: {
    roleName: string
    address: string
  }) => {
    const memberValues = Array(members?.[roleName] || []).filter(
      (a) => a !== address,
    )
    setMembers((prev) => ({
      ...prev,
      [roleName]: memberValues,
    }))
  }

  const defaultValues = getDefaultValues()
  const methods = useForm<any>({
    defaultValues: defaultValues,
  })

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    methods.handleSubmit((data) => {
      // Construct tier values
      const tierValues = {}
      const tierFieldNames = Object.keys(data).filter(
        (key) => key.split('-')[0] === 'tiers',
      )
      tierFieldNames.forEach((name) => {
        const tierName = name.split('-')[1]
        const propertyName = name.split('-')[2]
        tierValues[tierName] = { ...(tierValues[tierName] || {}) }
        tierValues[tierName][propertyName] = data[name]
      })
      const tiers = Object.keys(tierValues).map((key) => ({
        tierName: key,
        ...tierValues[key],
      }))

      // Construct role values
      const roleValues = {}
      const roleFieldNames = Object.keys(data).filter(
        (key) => key.split('-')[0] === 'roles',
      )
      roleFieldNames.forEach((name) => {
        const roleName = name.split('-')[1]
        const propertyName = name.split('-')[2]
        roleValues[roleName] = { ...(roleValues[roleName] || {}) }
        if (data[name]) {
          roleValues[roleName]['permissions'] = [
            ...(roleValues[roleName]['permissions'] || []),
            { [propertyName]: {} },
          ]
        }
      })
      const roles = Object.keys(roleValues).map((key) => ({
        roleName: key,
        default: data[`roles-${key}-default`],
        permissions: roleValues[key]['permissions'],
      }))

      const lastRevised = new BN(new Date().getTime() / 1000)

      const payload = {
        boardConfig: {
          tiers: tiers as BountyTier[],
          roles: roles as RoleSetting[],
          lastRevised: lastRevised as BN,
        },
        fundingAmount: 1000,
        initialContributorsWithRole: [],
      }
      // proposeInitBountyBoard(payload)
      push(`/dao/${symbol}/bounty-board`)
    })()
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    methods.setValue(e.currentTarget.name, Number(e.currentTarget.value))
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    methods.setValue(e.currentTarget.name, e.currentTarget.checked)
  }

  const confirm = () => {
    methods.handleSubmit((data) => {
      setConfirmedValues(data)
    })()
  }

  const addSkills = () => {}

  const addDifficulty = () => {}

  return (
    <FormProvider
      {...methods}
      //@ts-ignore
      defaultValues={defaultValues}
    >
      <form className="flex flex-col gap-6" onSubmit={submit}>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 px-6 py-8">
            <H2>SKILLS</H2>
            <div className="flex gap-4">
              {tags?.map((t) => (
                <Tag key={t?.text} disabled={confirming} {...t} />
              ))}
            </div>
            {!confirming && (
              <AddButton onClick={addSkills}>Add Skills</AddButton>
            )}
          </div>
        </Card>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 px-6 py-8">
            <H2>COMPENSATION STRUCTURE</H2>
            <div className="overflow-auto pb-6">
              <div className="grid grid-cols-7 gap-2 text-text-primary text-base leading-5 capitalize font-medium">
                {labels.map((l, index) => (
                  <span key={`l-${index}`} className="text-text-secondary">
                    {l}
                  </span>
                ))}
                {tiers.map(
                  ({
                    tierName,
                    difficultyLevel,
                    minRequiredReputation,
                    minRequiredSkillsPt,
                    reputationReward,
                    skillsPtReward,
                    payoutReward,
                    payoutMint,
                  }) => (
                    <React.Fragment key={tierName}>
                      <div className="uppercase flex items-center">
                        {tierName}
                      </div>
                      <div className="flex items-center">{difficultyLevel}</div>
                      <div className="flex items-center">
                        <FieldWrapper className="outline outline-1 outline-white/20">
                          <Input
                            className="w-1/2 text-right rounded-tr-none rounded-br-none"
                            prefix="$"
                            defaultValue={payoutReward}
                            name={`tiers-${tierName}-payoutReward`}
                            onChange={onChange}
                            disabled={confirming}
                          />

                          <Select
                            name={`tiers-${tierName}-payoutMint`}
                            className="w-1/2 rounded-tl-none rounded-bl-none"
                            disabled={confirming}
                          >
                            {Object.keys(DUMMY_MINT_PK)?.map((key) => (
                              <option key={key} value={DUMMY_MINT_PK[key]}>
                                {key}
                              </option>
                            ))}
                          </Select>
                        </FieldWrapper>
                      </div>
                      <div className="flex items-center">
                        <FieldWrapper className="gap-1 font-medium">
                          <Input
                            className="w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0"
                            prefixLogo={<Suitcase />}
                            defaultValue={skillsPtReward}
                            name={`tiers-${tierName}-skillsPtReward`}
                            onChange={onChange}
                            disabled={confirming}
                          />

                          {'Skill pts.'}
                        </FieldWrapper>
                      </div>
                      <div className="flex items-center">
                        <FieldWrapper className="gap-1 font-medium">
                          <Input
                            className="w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0"
                            prefixLogo={<Badge />}
                            defaultValue={reputationReward}
                            name={`tiers-${tierName}-reputationReward`}
                            onChange={onChange}
                            disabled={confirming}
                          />

                          {'Reputation'}
                        </FieldWrapper>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <FieldWrapper className="gap-1 font-medium">
                            <Input
                              className="w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0"
                              prefixLogo={<Suitcase />}
                              defaultValue={minRequiredSkillsPt}
                              name={`tiers-${tierName}-minRequiredSkillsPt`}
                              disabled={confirming}
                            />

                            {'Skill pts'}
                          </FieldWrapper>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FieldWrapper className="gap-1 font-medium">
                          <Input
                            className={`w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0`}
                            prefixLogo={<Badge />}
                            defaultValue={minRequiredReputation}
                            name={`tiers-${tierName}-minRequiredReputation`}
                            disabled={confirming}
                          />

                          {'Reputation'}
                        </FieldWrapper>
                      </div>
                    </React.Fragment>
                  ),
                )}
              </div>
            </div>
            {!confirming && (
              <AddButton onClick={addDifficulty}>Add Difficulty</AddButton>
            )}
          </div>
        </Card>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 px-6 py-8">
            <H2>ROLES AND PERMISSION</H2>
            <div className="overflow-auto pb-6">
              <div className="grid grid-cols-[168px_minmax(160px,_0.5fr)_minmax(160px,_0.5fr)_minmax(200px,_1.5fr)] gap-2 gap-y-6 text-text-primary text-base leading-5 capitalize font-medium">
                {roleLabels.map((l, index) => (
                  <span key={`l-${index}`} className="text-text-secondary">
                    {l}
                  </span>
                ))}
                {roles.map(
                  ({ roleName, permissions, default: isDefault }, index) => {
                    return (
                      <React.Fragment key={roleName}>
                        <div className="text-base flex font-medium text-tnight-200 gap-2">
                          <span>{roleName}</span>
                          {isDefault && (
                            <span className="py-1 px-1.5 rounded bg-tag-bg text-tag-text font-medium text-sm h-fit">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-medium text-tnight-200">
                            Bounty
                          </span>
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-createBounty`}
                            label="Create Bounty"
                            defaultChecked={recordExist(
                              permissions,
                              'createBounty',
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-updateBounty`}
                            label="Update Bounty"
                            defaultChecked={recordExist(
                              permissions,
                              'updateBounty',
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-deleteBounty`}
                            label="Delete Bounty"
                            defaultChecked={recordExist(
                              permissions,
                              'deleteBounty',
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-assignBounty`}
                            label="Assign Bounty"
                            defaultChecked={recordExist(
                              permissions,
                              'assignBounty',
                            )}
                            onChange={onSelect}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-medium text-tnight-200">
                            Submission
                          </span>
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-acceptSubmission`}
                            label="Accept"
                            defaultChecked={recordExist(
                              permissions,
                              'acceptSubmission',
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-rejectSubmission`}
                            label="Reject"
                            defaultChecked={recordExist(
                              permissions,
                              'rejectSubmission',
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`roles-${roleName}-requestChangeToSubmission`}
                            label="Request Changes"
                            defaultChecked={recordExist(
                              permissions,
                              'requestChangeToSubmission',
                            )}
                            onChange={onSelect}
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2">
                            {dummyAddresses.map((address) => (
                              <div
                                className="text-text-primary max-w-[125px] flex h-8 items-center px-2 text-sm bg-tag-bg"
                                key={address}
                              >
                                <span className=" text-ellipsis overflow-hidden whitespace-nowrap">
                                  {address}
                                </span>
                                {!confirming && (
                                  <Close className="text-base text-text-secondary flex-shrink-0 cursor-pointer hover:text-text-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                          {roleName === 'Core' && !confirming && (
                            <AddButton>Add Core Team Members</AddButton>
                          )}
                          {roleName === 'Contributor' && !confirming && (
                            <AddButton>Add Contributors</AddButton>
                          )}
                        </div>

                        {index < defaultFormValues.roles.length - 1 && (
                          <span className="col-span-4 h-px w-full bg-text-secondary" />
                        )}
                      </React.Fragment>
                    )
                  },
                )}
              </div>
            </div>
          </div>
        </Card>
        <div className="flex gap-4 items-center justify-center mx-auto">
          {!confirming && (
            <PrimaryButton onClick={() => confirm()}>
              Review Proposal
            </PrimaryButton>
          )}
          {confirming && (
            <>
              <PrimaryButton
                ghost
                onClick={() => setConfirmedValues(undefined)}
              >
                Back
              </PrimaryButton>
              <PrimaryButton type="submit">Submit</PrimaryButton>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
