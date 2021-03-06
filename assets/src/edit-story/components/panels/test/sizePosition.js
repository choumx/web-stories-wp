/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import { fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import SizePosition from '../sizePosition';
import { getDefinitionForType } from '../../../elements';
import { MULTIPLE_VALUE } from '../../form';
import { dataPixels } from '../../../units';
import { renderPanel } from './_utils';

jest.mock('../../../elements');

describe('Panels/SizePosition', () => {
  let defaultElement, defaultImage, defaultText, unlockAspectRatioElement;
  let defaultFlip;
  const aspectRatioLockButtonLabel = 'Aspect ratio lock';

  beforeEach(() => {
    defaultFlip = { horizontal: false, vertical: false };
    defaultElement = {
      id: '1',
      isBackground: false,
      width: 100,
      height: 80,
      isFill: false,
      rotationAngle: 0,
      lockAspectRatio: true,
    };
    unlockAspectRatioElement = {
      id: '1',
      isBackground: false,
      width: 100,
      height: 80,
      isFill: false,
      rotationAngle: 0,
      lockAspectRatio: false,
    };
    defaultImage = {
      ...defaultElement,
      type: 'image',
    };
    defaultText = {
      ...defaultElement,
      type: 'text',
    };
    getDefinitionForType.mockImplementation((type) => {
      return {
        isMedia: 'image' === type,
        canFlip: 'image' === type,
        canFill: true,
      };
    });
  });

  function renderSizePosition(...args) {
    return renderPanel(SizePosition, ...args);
  }

  it('should render <SizePosition /> panel', () => {
    const { getByText } = renderSizePosition([defaultElement]);
    const element = getByText('Size & position');
    expect(element).toBeDefined();
  });

  it('should render Background button for Image', () => {
    const { getByText } = renderSizePosition([defaultImage]);
    const element = getByText('Set as background');
    expect(element).toBeDefined();
  });

  describe('single selection', () => {
    it('should not render flip controls when not allowed', () => {
      const { queryByTitle } = renderSizePosition([defaultText]);
      const horiz = queryByTitle('Flip horizontally');
      const vert = queryByTitle('Flip vertically');
      expect(horiz).toBeNull();
      expect(vert).toBeNull();
    });

    it('should render default flip controls', () => {
      const { getByTitle } = renderSizePosition([defaultImage]);
      const horiz = getByTitle('Flip horizontally');
      const vert = getByTitle('Flip vertically');
      expect(horiz).not.toBeChecked();
      expect(vert).not.toBeChecked();
    });

    it('should render specified flip controls', () => {
      const { getByTitle } = renderSizePosition([
        {
          ...defaultImage,
          flip: { horizontal: true, vertical: true },
        },
      ]);
      const horiz = getByTitle('Flip horizontally');
      const vert = getByTitle('Flip vertically');
      expect(horiz).toBeChecked();
      expect(vert).toBeChecked();
    });

    it('should update flip horizontal controls', () => {
      const { getByTitle, pushUpdateForObject } = renderSizePosition([
        defaultImage,
      ]);
      const horiz = getByTitle('Flip horizontally');
      fireEvent.click(horiz);
      expect(pushUpdateForObject).toHaveBeenCalledWith(
        'flip',
        { horizontal: true, vertical: false },
        defaultFlip,
        true
      );
    });

    it('should update flip vertical controls', () => {
      const { getByTitle, pushUpdateForObject } = renderSizePosition([
        defaultImage,
      ]);
      const vert = getByTitle('Flip vertically');
      fireEvent.click(vert);
      expect(pushUpdateForObject).toHaveBeenCalledWith(
        'flip',
        { horizontal: false, vertical: true },
        defaultFlip,
        true
      );
    });

    it('should update fill', () => {
      const { getByTitle, pushUpdate } = renderSizePosition([defaultImage]);
      fireEvent.click(getByTitle('Fill'));
      expect(pushUpdate).toHaveBeenCalledWith({ isFill: true }, true);
    });

    it('should update width with lock ratio', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([defaultImage]);
      const input = getByTestId('width');
      fireEvent.change(input, { target: { value: '150' } });
      expect(pushUpdate).toHaveBeenCalledWith({
        width: 150,
        height: 150 / (100 / 80),
      });
    });

    it('should update height with lock ratio', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([defaultImage]);
      const input = getByTestId('height');
      fireEvent.change(input, { target: { value: '160' } });
      expect(pushUpdate).toHaveBeenCalledWith({
        height: 160,
        width: 160 * (100 / 80),
      });
    });

    it('should update width without lock ratio', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([
        unlockAspectRatioElement,
      ]);

      const input = getByTestId('width');
      fireEvent.change(input, { target: { value: '150' } });
      expect(pushUpdate).toHaveBeenCalledWith({ width: 150, height: 80 });
    });

    it('should update height without lock ratio', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([
        unlockAspectRatioElement,
      ]);

      const input = getByTestId('height');
      fireEvent.change(input, { target: { value: '160' } });
      expect(pushUpdate).toHaveBeenCalledWith({ height: 160, width: 100 });
    });

    it('should update width with lock ratio and empty value', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([defaultImage]);
      const input = getByTestId('width');
      fireEvent.change(input, { target: { value: '' } });
      expect(pushUpdate).toHaveBeenCalledWith({ width: '', height: '' });
    });

    it('should update height with lock ratio and empty value', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([defaultImage]);

      const input = getByTestId('height');
      fireEvent.change(input, { target: { value: '' } });
      expect(pushUpdate).toHaveBeenCalledWith({ height: '', width: '' });
    });

    it('should update width without lock ratio and empty value', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([
        unlockAspectRatioElement,
      ]);
      const input = getByTestId('width');
      fireEvent.change(input, { target: { value: '' } });
      expect(pushUpdate).toHaveBeenCalledWith({ width: '', height: 80 });
    });

    it('should update height without lock ratio and empty value', () => {
      const { getByTestId, pushUpdate } = renderSizePosition([
        unlockAspectRatioElement,
      ]);
      const input = getByTestId('height');
      fireEvent.change(input, { target: { value: '' } });
      expect(pushUpdate).toHaveBeenCalledWith({ height: '', width: 100 });
    });

    it('should update lock ratio to false for element', () => {
      const { getByLabelText, pushUpdate } = renderSizePosition([defaultImage]);
      fireEvent.click(getByLabelText(aspectRatioLockButtonLabel));
      expect(pushUpdate).toHaveBeenCalledWith({ lockAspectRatio: false });
    });

    it('should update lock ratio to true for unlock aspect ratio element', () => {
      const { getByLabelText, pushUpdate } = renderSizePosition([
        unlockAspectRatioElement,
      ]);
      fireEvent.click(getByLabelText(aspectRatioLockButtonLabel));
      expect(pushUpdate).toHaveBeenCalledWith({ lockAspectRatio: true });
    });
  });

  describe('multi selection', () => {
    let image, imageWithSameSize, imageWithDifferentSize;
    let unlockImage, unlockImageWithSameSize;

    beforeEach(() => {
      image = defaultImage;
      unlockImage = {
        ...defaultImage,
        lockAspectRatio: false,
      };
      imageWithSameSize = { ...image, id: 'imageWithSameSize' };
      unlockImageWithSameSize = {
        ...imageWithSameSize,
        lockAspectRatio: false,
      };
      imageWithDifferentSize = {
        ...image,
        id: 'imageWithDifferentSize',
        width: 200,
        height: 120,
      };
    });

    it('should update flip controls', () => {
      const { getByTitle, pushUpdateForObject } = renderSizePosition([
        {
          ...image,
          flip: { horizontal: true, vertical: false },
        },
        {
          ...image,
          flip: { horizontal: false, vertical: true },
        },
      ]);
      const horiz = getByTitle('Flip horizontally');
      fireEvent.click(horiz);
      expect(pushUpdateForObject).toHaveBeenCalledWith(
        'flip',
        { horizontal: true, vertical: MULTIPLE_VALUE },
        defaultFlip,
        true
      );
    });

    it('should update width with lock ratio and same size', () => {
      const { getByTestId, pushUpdate, submit } = renderSizePosition([
        image,
        imageWithSameSize,
      ]);
      const input = getByTestId('width');
      fireEvent.change(input, { target: { value: '150' } });
      expect(pushUpdate).toHaveBeenCalledWith({
        width: 150,
        height: dataPixels(150 / (100 / 80)),
      });

      const submits = submit({ width: 150, height: MULTIPLE_VALUE });
      expect(submits[image.id]).toStrictEqual({
        rotationAngle: 0,
        width: 150,
        height: dataPixels(150 / (100 / 80)),
      });
      expect(submits[imageWithSameSize.id]).toStrictEqual({
        rotationAngle: 0,
        width: 150,
        height: dataPixels(150 / (100 / 80)),
      });
    });

    it('should update width with lock ratio and different size', () => {
      const { getByTestId, pushUpdate, submit } = renderSizePosition([
        image,
        imageWithDifferentSize,
      ]);
      const input = getByTestId('width');
      fireEvent.change(input, { target: { value: '150' } });
      expect(pushUpdate).toHaveBeenCalledWith({
        width: 150,
        height: MULTIPLE_VALUE,
      });

      const submits = submit({ width: 150, height: MULTIPLE_VALUE });
      expect(submits[image.id]).toStrictEqual({
        rotationAngle: 0,
        width: 150,
        height: 150 / (100 / 80),
      });
      expect(submits[imageWithDifferentSize.id]).toStrictEqual({
        rotationAngle: 0,
        width: 150,
        height: dataPixels(150 / (200 / 120)),
      });
    });

    it('should update height with lock ratio and different size', () => {
      const { getByTestId, pushUpdate, submit } = renderSizePosition([
        image,
        imageWithDifferentSize,
      ]);
      const input = getByTestId('height');
      fireEvent.change(input, { target: { value: '160' } });
      expect(pushUpdate).toHaveBeenCalledWith({
        height: 160,
        width: MULTIPLE_VALUE,
      });

      const submits = submit({ height: 160, width: MULTIPLE_VALUE });
      expect(submits[image.id]).toStrictEqual({
        rotationAngle: 0,
        height: 160,
        width: 160 * (100 / 80),
      });
      expect(submits[imageWithDifferentSize.id]).toStrictEqual({
        rotationAngle: 0,
        height: 160,
        width: dataPixels(160 * (200 / 120)),
      });
    });

    it('should disable aspect ratio lock if all elements had lock enabled', () => {
      const { getByLabelText, pushUpdate } = renderSizePosition([
        image,
        imageWithSameSize,
      ]);
      fireEvent.click(getByLabelText(aspectRatioLockButtonLabel));
      expect(pushUpdate).toHaveBeenCalledWith({ lockAspectRatio: false });
    });

    it('should disable aspect ratio lock if elements had different settings for aspect ratio lock', () => {
      const { getByLabelText, pushUpdate } = renderSizePosition([
        unlockImage,
        imageWithSameSize,
      ]);
      fireEvent.click(getByLabelText(aspectRatioLockButtonLabel));
      expect(pushUpdate).toHaveBeenCalledWith({ lockAspectRatio: false });
    });

    it('should enable aspect ratio lock only if all elements had lock disabled', () => {
      const { getByLabelText, pushUpdate } = renderSizePosition([
        unlockImageWithSameSize,
        unlockImage,
      ]);
      fireEvent.click(getByLabelText(aspectRatioLockButtonLabel));
      expect(pushUpdate).toHaveBeenCalledWith({ lockAspectRatio: true });
    });
  });
});
