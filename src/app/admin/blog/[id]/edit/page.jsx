import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({ params }) {
    const { id } = await params;
    return <BlogPostForm mode="edit" editId={id} />;
}
