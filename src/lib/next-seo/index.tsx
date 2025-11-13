import Head from 'next/head';

export interface AdditionalMetaTag {
        name?: string;
        property?: string;
        httpEquiv?: string;
        content: string;
        keyOverride?: string;
}

export interface AdditionalLinkTag {
        rel: string;
        href: string;
        sizes?: string;
        type?: string;
        media?: string;
        keyOverride?: string;
}

export interface OpenGraphImage {
        url: string;
        width?: number;
        height?: number;
        alt?: string;
        type?: string;
}

export interface OpenGraph {
        url?: string;
        title?: string;
        description?: string;
        siteName?: string;
        type?: string;
        images?: OpenGraphImage[];
}

export interface TwitterCard {
        handle?: string;
        site?: string;
        cardType?: string;
}

export interface NextSeoProps {
        title?: string;
        defaultTitle?: string;
        description?: string;
        canonical?: string;
        noindex?: boolean;
        openGraph?: OpenGraph;
        twitter?: TwitterCard;
        additionalMetaTags?: AdditionalMetaTag[];
        additionalLinkTags?: AdditionalLinkTag[];
}

export type DefaultSeoProps = NextSeoProps;

const Seo = ({
        title,
        defaultTitle,
        description,
        canonical,
        noindex,
        openGraph,
        twitter,
        additionalMetaTags,
        additionalLinkTags,
}: NextSeoProps) => {
        const computedTitle = title ?? defaultTitle;
        const ogTitle = openGraph?.title ?? computedTitle;
        const ogDescription = openGraph?.description ?? description;
        const ogUrl = openGraph?.url ?? canonical;
        const ogSiteName = openGraph?.siteName;
        const ogType = openGraph?.type ?? (openGraph ? 'website' : undefined);
        const ogImages = openGraph?.images ?? [];

        return (
                <Head>
                        {computedTitle && <title key='title'>{computedTitle}</title>}
                        {description && (
                                <meta key='description' name='description' content={description} />
                        )}
                        {canonical && <link key='canonical' rel='canonical' href={canonical} />}
                        {noindex && (
                                <meta key='robots' name='robots' content='noindex, nofollow' />
                        )}
                        {ogTitle && (
                                <meta key='og:title' property='og:title' content={ogTitle} />
                        )}
                        {ogDescription && (
                                <meta
                                        key='og:description'
                                        property='og:description'
                                        content={ogDescription}
                                />
                        )}
                        {ogUrl && <meta key='og:url' property='og:url' content={ogUrl} />}
                        {ogSiteName && (
                                <meta key='og:site_name' property='og:site_name' content={ogSiteName} />
                        )}
                        {ogType && <meta key='og:type' property='og:type' content={ogType} />}
                        {ogImages.map((image, index) => (
                                <meta key={`og:image:${index}`} property='og:image' content={image.url} />
                        ))}
                        {ogImages.map((image, index) => (
                                image.width ? (
                                        <meta
                                                key={`og:image:width:${index}`}
                                                property='og:image:width'
                                                content={image.width.toString()}
                                        />
                                ) : null
                        ))}
                        {ogImages.map((image, index) => (
                                image.height ? (
                                        <meta
                                                key={`og:image:height:${index}`}
                                                property='og:image:height'
                                                content={image.height.toString()}
                                        />
                                ) : null
                        ))}
                        {ogImages.map((image, index) => (
                                image.alt ? (
                                        <meta
                                                key={`og:image:alt:${index}`}
                                                property='og:image:alt'
                                                content={image.alt}
                                        />
                                ) : null
                        ))}
                        {ogImages.map((image, index) => (
                                image.type ? (
                                        <meta
                                                key={`og:image:type:${index}`}
                                                property='og:image:type'
                                                content={image.type}
                                        />
                                ) : null
                        ))}
                        {twitter?.cardType && (
                                <meta
                                        key='twitter:card'
                                        name='twitter:card'
                                        content={twitter.cardType}
                                />
                        )}
                        {twitter?.handle && (
                                <meta key='twitter:creator' name='twitter:creator' content={twitter.handle} />
                        )}
                        {twitter?.site && (
                                <meta key='twitter:site' name='twitter:site' content={twitter.site} />
                        )}
                        {computedTitle && (
                                <meta key='twitter:title' name='twitter:title' content={computedTitle} />
                        )}
                        {ogDescription && (
                                <meta
                                        key='twitter:description'
                                        name='twitter:description'
                                        content={ogDescription}
                                />
                        )}
                        {ogImages[0]?.url && (
                                <meta
                                        key='twitter:image'
                                        name='twitter:image'
                                        content={ogImages[0].url}
                                />
                        )}
                        {additionalMetaTags?.map((tag, index) => (
                                <meta
                                        key={tag.keyOverride ?? `meta:${index}`}
                                        name={tag.name}
                                        property={tag.property}
                                        httpEquiv={tag.httpEquiv}
                                        content={tag.content}
                                />
                        ))}
                        {additionalLinkTags?.map((tag, index) => (
                                <link
                                        key={tag.keyOverride ?? `link:${index}`}
                                        rel={tag.rel}
                                        href={tag.href}
                                        sizes={tag.sizes}
                                        type={tag.type}
                                        media={tag.media}
                                />
                        ))}
                </Head>
        );
};

export const DefaultSeo = (props: DefaultSeoProps) => <Seo {...props} />;
export const NextSeo = (props: NextSeoProps) => <Seo {...props} />;
