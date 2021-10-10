import { SolarSystem } from '@ping-board/common'
import { useCallback, useMemo } from 'react'
import {
  Autocomplete,
  AutocompleteOptionKey,
  AutocompleteProps,
} from '../../components/autocomplete'
import { useGetSolarSystemsQuery } from '../../store'

type AutocompleteRestProps = Omit<
  AutocompleteProps<SolarSystem>,
  'options' | 'searchKeys' | 'value' | 'onChange' | 'optionName'
>
export interface SolarSystemInputProps extends AutocompleteRestProps {
  value: string | null
  onChange: (newValue: SolarSystem | null) => void
}
export function SolarSystemInput({
  value,
  onChange,
  ...autocompleteProps
}: SolarSystemInputProps & AutocompleteRestProps): JSX.Element {
  const query = useGetSolarSystemsQuery()
  const systems = query.data?.solarSystems ?? []

  const searchKeys = useMemo<AutocompleteOptionKey<SolarSystem>[]>(() => [
    { name: 'name', weight: 100 },
    { name: 'constellation', weight: 10 },
    { name: 'region', weight: 1 },
  ], [])

  const renderOption = useCallback((option: SolarSystem) => (
    `${option.name} (${option.constellation}, ${option.region})`
  ), [])
  const optionName = useCallback((option: SolarSystem) => option.name, [])

  return (
    <Autocomplete
      options={systems}
      optionName={optionName}
      loadingText={query.isFetching
        ? <>loading&hellip;</>
        : query.isError
          ? 'error loading systems'
          : false
      }
      resultLimit={50}
      searchKeys={searchKeys}
      value={value}
      onChange={onChange}
      renderOption={renderOption}
      {...autocompleteProps}
    />
  )
}
