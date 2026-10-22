import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Controls from '../../../src/components/Controls';
import { defaults, InputProvider, SettingsProvider } from '../../../src/hooks';

const slugs: string[] = [];

vi.mock('../../../src/hooks', async importOriginal => {
  const original = await importOriginal<typeof import('../../../src/hooks')>();
  return {
    ...original,
    useData: () => {
      const data = original.useData();
      return {
        ...data,
        capabilities: { ...data.capabilities, coordinates: true },
        meetings: { test: { distance: undefined } },
        slugs,
      };
    },
  };
});

describe('<Controls />', () => {
  const settings = defaults;

  afterEach(() => {
    cleanup();
    slugs.length = 0;
  });

  it.each([
    { language: 'en', search: 'Search', location: 'Near Location' },
    { language: 'es', search: 'Buscar', location: 'Ubicación cercana' },
  ] as const)(
    'names the search group in $language and updates it when the mode changes',
    ({ language, search, location }) => {
      slugs.push('test');
      render(
        <MemoryRouter>
          <SettingsProvider userSettings={{ language } as TSMLReactConfig}>
            <InputProvider>
              <Controls />
            </InputProvider>
          </SettingsProvider>
        </MemoryRouter>
      );

      const group = screen.getByRole('group', { name: search, exact: true });
      expect(within(group).getByRole('searchbox')).toHaveAccessibleName(search);
      fireEvent.click(within(group).getByRole('button', { name: search }));
      fireEvent.click(screen.getByRole('button', { name: location }));

      const locationGroup = screen.getByRole('group', {
        name: location,
        exact: true,
      });
      expect(within(locationGroup).getByRole('searchbox')).toHaveAccessibleName(
        location
      );
    }
  );

  it('is empty with no meetings', () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsProvider userSettings={settings}>
          <Controls />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});
