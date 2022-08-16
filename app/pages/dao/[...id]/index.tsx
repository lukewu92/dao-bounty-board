import { useEffect, useMemo, useState } from 'react';

import { DAOPageHeader } from '../../../components/DAOPageHeader';
import { PageContainer } from '../../../components/PageContainer';
import { useRealmInfoBySymbol } from '../../../hooks/useRealmInfoBySymbol';
import { useRouter } from '../../../hooks/useRouter';
import { BountyBoard } from '../../../sub-pages/dao/[id]/bounty-board';
import { ProposeBountyBoard } from '../../../sub-pages/dao/[id]/propose-bounty-board';

import type { NextPage } from 'next'
export type DAOTabsType = 'bounty-board' | 'proposals' | 'about'

const DAO: NextPage = () => {
  const { ids, replace, currentRoute, symbol } = useRouter()
  const daoId = ids?.[0]
  const activeTab = ids?.[1]

  const { realmInfo } = useRealmInfoBySymbol(symbol)

  useEffect(() => {
    if (!activeTab && daoId) {
      replace(`/dao/${daoId}/bounty-board`)
    }
  }, [daoId])
  return (
    <PageContainer>
      <DAOPageHeader />
      {currentRoute === 'bounty-board' && <BountyBoard />}
      {currentRoute === 'propose' && realmInfo && (
        <ProposeBountyBoard realmId={realmInfo.realmId} />
      )}
    </PageContainer>
  )
}

export default DAO
