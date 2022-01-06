type Icon = (color?: string, size?: string) => string;

const colorAttribute = (color?: string, type = 'fill') =>
  color ? `${type}="${color}"` : '';

const sizeAttribute = (size = '100%') =>
  `width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`;
const svgContainer = (child: string, size?: string) =>
  `<svg ${sizeAttribute(
    size
  )} fill="none" xmlns="http://www.w3.org/2000/svg">${child}</svg>`;
const icons: { [name: string]: Icon } = {
  arrow: (color, size) =>
    svgContainer(
      `<path class="icon" d="M9 7L5.25 9.59808L5.25 4.40192L9 7Z"${colorAttribute(
        color
      )}/>`,
      size
    ),
  visible: (color, size) =>
    svgContainer(
      `
        <path class="icon" d="M7 8.75C7.96688 8.75 8.75 7.96688 8.75 7C8.75 6.03312 7.96688 5.25 7 5.25C6.034 5.25 5.25 6.03312 5.25 7C5.25 7.96688 6.034 8.75 7 8.75Z" ${colorAttribute(
          color
        )}/>
        <path class="icon" fill-rule="evenodd" clip-rule="evenodd" d="M6.99996 3.5C9.51821 3.5 11.7057 4.91838 12.8056 7C11.7057 9.08162 9.51821 10.5 6.99996 10.5C4.48171 10.5 2.29509 9.08162 1.19434 7C2.29509 4.91838 4.48171 3.5 6.99996 3.5ZM6.99996 9.625C4.98746 9.625 3.21821 8.58025 2.20671 7C3.21821 5.41975 4.98746 4.375 6.99996 4.375C9.01246 4.375 10.7817 5.41975 11.7941 7C10.7817 8.58025 9.01246 9.625 6.99996 9.625Z" ${colorAttribute(
          color
        )}/>
      `,
      size
    ),
  invisible: (color, size) =>
    svgContainer(
      `<path class="icon" d="M11.8194 6.82588C12.3059 6.36475 12.7259 5.83362 13.0637 5.25H12.0268C10.9199 6.83725 9.08068 7.875 6.99994 7.875C4.91919 7.875 3.07994 6.83725 1.97219 5.25H0.936186C1.27394 5.83362 1.69394 6.36475 2.17956 6.82588L0.783936 8.2215L1.40344 8.84012L2.85244 7.39025C3.47369 7.84787 4.17456 8.20575 4.92969 8.43938L4.38981 10.3828L5.23331 10.6172L5.78106 8.64412C6.17743 8.715 6.58431 8.75 6.99994 8.75C7.41556 8.75 7.82244 8.71412 8.21794 8.645L8.76568 10.6172L9.60919 10.3828L9.06931 8.43938C9.82444 8.20575 10.5244 7.84787 11.1466 7.38937L12.5964 8.84012L13.2159 8.2215L11.8203 6.82588H11.8194Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
  delete: (color, size) =>
    svgContainer(
      `
        <path class="icon" d="M10.5 1H4L0.5 5L4 9H10.5C10.7652 9 11.0196 8.89464 11.2071 8.70711C11.3946 8.51957 11.5 8.26522 11.5 8V2C11.5 1.73478 11.3946 1.48043 11.2071 1.29289C11.0196 1.10536 10.7652 1 10.5 1V1Z" stroke-linecap="round" stroke-linejoin="round" ${colorAttribute(
          color,
          'stroke'
        )}/>
        <path class="icon" d="M9 3.5L6 6.5" stroke-linecap="round" stroke-linejoin="round"  ${colorAttribute(
          color
        )}/>
        <path class="icon" d="M6 3.5L9 6.5" stroke-linecap="round" stroke-linejoin="round" ${colorAttribute(
          color
        )}/>
      `,
      size
    ),

  autoLayout: (color, size) =>
    svgContainer(
      `<path class="icon" fill-rule="evenodd" clip-rule="evenodd" d="M2.625 2.625H11.375V6.125H2.625V2.625ZM2.625 7.875H11.375V11.375H2.625V7.875ZM3.5 3.5V5.25H10.5V3.5H3.5ZM3.5 8.75V10.5H10.5V8.75H3.5Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
  image: (color, size) =>
    svgContainer(
      `<path class="icon" fill-rule="evenodd" clip-rule="evenodd" d="M10.5 5.25C10.5 6.21688 9.71688 7 8.75 7C7.78312 7 7 6.21688 7 5.25C7 4.28312 7.78312 3.5 8.75 3.5C9.71688 3.5 10.5 4.28312 10.5 5.25ZM9.625 5.25C9.625 5.733 9.233 6.125 8.75 6.125C8.267 6.125 7.875 5.733 7.875 5.25C7.875 4.767 8.267 4.375 8.75 4.375C9.233 4.375 9.625 4.767 9.625 5.25ZM2.625 1.75C2.142 1.75 1.75 2.142 1.75 2.625V11.375C1.75 11.858 2.142 12.25 2.625 12.25H11.375C11.858 12.25 12.25 11.858 12.25 11.375V2.625C12.25 2.142 11.858 1.75 11.375 1.75H2.625ZM11.375 2.625H2.625V8.13138L4.8125 5.94388L10.2436 11.375H11.375V2.625ZM2.625 11.375V9.36862L4.8125 7.18112L9.00638 11.375H2.625Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
  instance: (color, size) =>
    svgContainer(
      `<path class="icon" fill-rule="evenodd" clip-rule="evenodd" d="M0.827881 7L6.99988 0.828003L13.1719 7L6.99988 13.172L0.827881 7ZM6.99988 11.828L11.8279 7L6.99988 2.172L2.17188 7L6.99988 11.828Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
  component: (color, size) =>
    svgContainer(
      `<path class="icon" d="M4.36675 3.20598L6.99992 0.583313L9.63309 3.20598L6.99992 5.82865L4.36675 3.20598ZM3.20592 9.63431L0.583252 6.99998L3.20592 4.36681L5.82858 6.99998L3.20592 9.63315V9.63431ZM9.63425 10.794L6.99992 13.4166L4.36675 10.794L6.99992 8.17131L9.63309 10.794H9.63425ZM13.4166 6.99998L10.7939 4.36681L8.17125 6.99998L10.7939 9.63315L13.4166 6.99998Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
  frame: (color, size) =>
    svgContainer(
      `<path class="icon" fill-rule="evenodd" clip-rule="evenodd" d="M5 1.5V4H9V1.5H10V4H12.5V5H10V9H12.5V10H10V12.5H9V10H5V12.5H4V10H1.5V9H4V5H1.5V4H4V1.5H5ZM9 9V5H5V9H9Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
  group: (color, size) =>
    svgContainer(
      `<path class="icon" d="M8 2H6V3H8V2ZM10.5 11H11V10.5H12V12H10.5V11ZM3 6V8H2V6H3ZM11 3.5V3H10.5V2H12V3.5H11ZM11 6V8H12V6H11ZM3 3.5V3H3.5V2H2V3.5H3ZM2 10.5H3V11H3.5V12H2V10.5ZM8 11H6V12H8V11Z" ${colorAttribute(
        color
      )}/>`,
      size
    ),
};

export default icons;
