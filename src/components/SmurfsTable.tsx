import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {smurfsData} from '@/data/smurfs'
import type {ActiveCell, Smurf, SmurfLocation} from '@/types/smurfs'
import './SmurfsTable.css'

function formatCoordinates(location: SmurfLocation): string {
  return `(${location.x}, ${location.y})`
}

function formatCreatedAt(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function QuotesCell({quotes}: {quotes: string[]}) {
  return (
    <ul className="quotes-list">
      {quotes.map((quote, index) => (
        <li key={index}>{quote}</li>
      ))}
    </ul>
  )
}

export default function SmurfsTable() {
  const [activeCell, setActiveCell] = useState<ActiveCell>({row: 0, col: 0})
  const tableRef = useRef<HTMLTableElement>(null)
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map())

  const columns = useMemo<ColumnDef<Smurf>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: 'First Name',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
      },
      {
        id: 'location',
        header: 'Location',
        accessorFn: (row) => formatCoordinates(row.location),
      },
      {
        id: 'createdAt',
        header: 'Creation Time',
        accessorFn: (row) => formatCreatedAt(row.createdAt),
      },
      {
        id: 'quotes',
        header: 'Quotes',
        cell: ({row}) => <QuotesCell quotes={row.original.quotes} />,
      },
    ],
    [],
  )

  const table = useReactTable({
    data: smurfsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rowCount = table.getRowModel().rows.length
  const colCount = table.getAllColumns().length

  const cellKey = (row: number, col: number) => `${row}-${col}`

  const focusCell = useCallback((row: number, col: number) => {
    const key = cellKey(row, col)
    const cell = cellRefs.current.get(key)
    cell?.focus()
  }, [])

  const moveActiveCell = useCallback(
    (rowDelta: number, colDelta: number) => {
      setActiveCell((prev) => {
        const nextRow = Math.max(0, Math.min(rowCount - 1, prev.row + rowDelta))
        const nextCol = Math.max(0, Math.min(colCount - 1, prev.col + colDelta))
        focusCell(nextRow, nextCol)
        return {row: nextRow, col: nextCol}
      })
    },
    [rowCount, colCount, focusCell],
  )

  const [isFirstKeyPress, setIsFirstKeyPress] = useState(true)

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTableElement>) => {
      if (isFirstKeyPress) {
        setIsFirstKeyPress(false)
        return
      }

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          moveActiveCell(-1, 0)
          break
        case 'ArrowDown':
          event.preventDefault()
          moveActiveCell(1, 0)
          break
        case 'ArrowLeft':
          event.preventDefault()
          moveActiveCell(0, -1)
          break
        case 'ArrowRight':
          event.preventDefault()
          moveActiveCell(0, 1)
          break
        default:
          break
      }
    },
    [moveActiveCell, isFirstKeyPress],
  )

  useEffect(() => {
    focusCell(activeCell.row, activeCell.col)
  }, [activeCell.row, activeCell.col, focusCell])

  const [activeCellAnnouncement, setActiveCellAnnouncement] = useState('')

  useEffect(() => {
    const descriptions = smurfsData.map(
      (smurf) =>
        `${smurf.firstName} ${smurf.lastName}, spotted at ${formatCoordinates(
          smurf.location,
        )}, joined ${formatCreatedAt(smurf.createdAt)}`,
    )
    setActiveCellAnnouncement(descriptions[activeCell.row] ?? '')
  }, [activeCell])

  return (
    <div className="smurfs-table-wrapper">
      <p className="smurfs-table-hint">
        Click a cell or use arrow keys to navigate the table.
      </p>
      <div aria-live="polite" className="sr-only">
        {activeCellAnnouncement}
      </div>
      <table ref={tableRef} className="smurfs-table" onKeyDown={handleKeyDown}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, colIndex) => {
                const isActive =
                  activeCell.row === rowIndex && activeCell.col === colIndex
                const key = cellKey(rowIndex, colIndex)

                return (
                  <td
                    key={cell.id}
                    ref={(node) => {
                      if (node) {
                        cellRefs.current.set(key, node)
                      } else {
                        cellRefs.current.delete(key)
                      }
                    }}
                    tabIndex={isActive ? 0 : -1}
                    className={isActive ? 'cell-active' : undefined}
                    onFocus={() =>
                      setActiveCell({row: rowIndex, col: colIndex})
                    }
                    onClick={() => {
                      setActiveCell({row: rowIndex, col: colIndex})
                      focusCell(rowIndex, colIndex)
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
