import {afterEach, describe, expect, it, vi} from 'vitest'
import {cleanup, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmurfsTable from './SmurfsTable'
import {smurfsData} from '@/data/smurfs'

afterEach(() => {
  cleanup()
})

describe('SmurfsTable', () => {
  it('renders every smurf as a table row', () => {
    render(<SmurfsTable />)

    for (const smurf of smurfsData) {
      expect(screen.getByText(smurf.firstName)).toBeInTheDocument()
    }
  })

  it('moves the active cell with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<SmurfsTable />)

    const firstCell = screen.getByText(smurfsData[0].firstName).closest('td')
    expect(firstCell).toHaveAttribute('data-active', 'true')

    firstCell?.focus()
    await user.keyboard('{ArrowDown}')

    const movedCell = screen.getByText(smurfsData[1].firstName).closest('td')
    expect(movedCell).toHaveAttribute('data-active', 'true')
    expect(firstCell).toHaveAttribute('data-active', 'false')
  })

  it('moves the active cell on the very first arrow key press', async () => {
    const user = userEvent.setup()
    render(<SmurfsTable />)

    const firstCell = screen.getByText(smurfsData[0].firstName).closest('td')
    const firstRow = firstCell?.closest('tr')
    firstCell?.focus()

    await user.keyboard('{ArrowRight}')

    const cellsInFirstRow = firstRow?.querySelectorAll('td')
    expect(cellsInFirstRow?.[1]).toHaveAttribute('data-active', 'true')
    expect(firstCell).toHaveAttribute('data-active', 'false')
  })

  it('does not reformat the whole dataset when only the active cell changes', async () => {
    const formatSpy = vi.spyOn(Date.prototype, 'toLocaleString')
    const user = userEvent.setup()
    render(<SmurfsTable />)

    const firstCell = screen.getByText(smurfsData[0].firstName).closest('td')
    firstCell?.focus()

    // Spend the first press getting past any "arm the navigation" behavior
    // so this test only measures the cost of a move that actually happens.
    await user.keyboard('{ArrowDown}')
    formatSpy.mockClear()

    await user.keyboard('{ArrowDown}')

    // Moving the active cell should, at most, touch the smurf(s) involved
    // in the move - it should never re-format every row in the dataset.
    expect(formatSpy.mock.calls.length).toBeLessThan(smurfsData.length)

    formatSpy.mockRestore()
  })
})
