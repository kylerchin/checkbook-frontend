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
        <body className='scrollbar-thin scrollbar-rounded-full scrollbar-thumb-gray-900 scrollbar-track-gray-100 dark:scrollbar-track-bruhdark dark:scrollbar-thumb-zinc-300'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
