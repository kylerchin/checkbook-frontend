import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang='en'>
        <Head></Head>
        <body className='scrollbar-rounded-full scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-900 dark:scrollbar-track-bruhdark dark:scrollbar-thumb-zinc-300'>
          <Main />
          <style>
            {`#__next {
                position: static;
                width: 100%;
              }`}
          </style>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
