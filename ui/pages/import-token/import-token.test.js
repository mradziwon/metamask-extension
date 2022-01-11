import React from 'react';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import ImportToken from './import-token.container';
import configureStore from '../../store/store';
import { fireEvent } from '@testing-library/dom';
import configureMockStore from 'redux-mock-store';
import { setBackgroundConnection } from '../../../test/jest';
import thunk from 'redux-thunk';
import * as Actions from '../../store/actions';

describe('Import Token', () => {
  const historyStub = jest.fn();
  const props = {
    history: {
      push: historyStub,
    },
    showSearchTab: true,
    tokenList: {},
  };

  const render = () => {
    return renderWithProvider(
      <ImportToken {...props} />,
      configureStore({
        metamask: {
          tokens: [],
          provider: { chainId: '0x1' },
          frequentRpcListDetail: [],
          identities: {},
        },
        history: {
          mostRecentOverviewPage: '/',
        },
      }),
    );
  };

  describe('Import Token', () => {
    it('Add Custom Token button is disabled when no fields are populated', () => {
      const { getByText } = render();
      const customTokenButton = getByText('Custom Token');
      fireEvent.click(customTokenButton);
      const submit = getByText('Add Custom Token');

      expect(submit).toBeDisabled();
    });

    it('edits token address', () => {
      const { getByText } = render();
      const customTokenButton = getByText('Custom Token');
      fireEvent.click(customTokenButton);

      const tokenAddress = '0x617b3f8050a0BD94b6b1da02B4384eE5B4DF13F4';
      const event = { target: { value: tokenAddress } };
      fireEvent.change(document.getElementById('custom-address'), event);

      expect(document.getElementById('custom-address').value).toStrictEqual(
        tokenAddress,
      );
    });

    it('edits token symbol', () => {
      const { getByText } = render();
      const customTokenButton = getByText('Custom Token');
      fireEvent.click(customTokenButton);

      const tokenSymbol = 'META';
      const event = { target: { value: tokenSymbol } };
      fireEvent.change(document.getElementById('custom-symbol'), event);

      expect(document.getElementById('custom-symbol').value).toStrictEqual(
        tokenSymbol,
      );
    });

    it('edits token decimal precision', () => {
      const { getByText } = render();
      const customTokenButton = getByText('Custom Token');
      fireEvent.click(customTokenButton);

      const tokenPrecision = '2';
      const event = { target: { value: tokenPrecision } };
      fireEvent.change(document.getElementById('custom-decimals'), event);

      expect(document.getElementById('custom-decimals').value).toStrictEqual(
        tokenPrecision,
      );
    });

    it('Adds custom tokens successfully', () => {
      const setPendingTokensSpy = jest.spyOn(Actions, 'setPendingTokens');
      const { getByText } = render();
      const customTokenButton = getByText('Custom Token');
      fireEvent.click(customTokenButton);

      const submit = getByText('Add Custom Token');
      expect(submit).toBeDisabled();

      const tokenAddress = '0x617b3f8050a0BD94b6b1da02B4384eE5B4DF13F4';
      fireEvent.change(document.getElementById('custom-address'), {
        target: { value: tokenAddress },
      });
      expect(submit).not.toBeDisabled();

      const tokenSymbol = 'META';
      fireEvent.change(document.getElementById('custom-symbol'), {
        target: { value: tokenSymbol },
      });

      const tokenPrecision = '2';
      fireEvent.change(document.getElementById('custom-decimals'), {
        target: { value: tokenPrecision },
      });

      expect(submit).not.toBeDisabled();
      fireEvent.click(submit);
      expect(setPendingTokensSpy).toHaveBeenCalledWith({
        customToken: {
          address: tokenAddress,
          decimals: Number(tokenPrecision),
          symbol: tokenSymbol,
        },
        selectedTokens: {},
        tokenAddressList: [],
      });
      expect(historyStub).toHaveBeenCalledWith('/confirm-import-token');
    });

    it('Cancels out of import token flow', () => {
      const clearPendingTokens = jest.spyOn(Actions, 'clearPendingTokens');
      const { getByTestId } = render();
      const closeButton = getByTestId('header-close-button')
      fireEvent.click(closeButton);

      expect(clearPendingTokens).toHaveBeenCalled();
      expect(historyStub).toHaveBeenCalledWith('/');
    });
  });
});
