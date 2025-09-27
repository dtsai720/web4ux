package htmlparser

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseContentForWinfittsDetails(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		htmlContent    string
		expectedResult [][]string
	}{
		{
			name:           "empty content",
			htmlContent:    "",
			expectedResult: [][]string{{""}},
		},
		{
			name:           "no data1-pack divs",
			htmlContent:    "<div>some content</div>\n<p>other content</p>",
			expectedResult: [][]string{{"<div>some content</div>", "<p>other content</p>"}},
		},
		{
			name: "single data1-pack div",
			htmlContent: `<div class="data1-pack">
<p>content inside pack</p>
<span>more content</span>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"data1-pack\">", "<p>content inside pack</p>", "<span>more content</span>", "</div>"},
			},
		},
		{
			name: "multiple data1-pack divs",
			htmlContent: `<div class="data1-pack">
<p>first pack content</p>
</div>
<div class="other">some other content</div>
<div class="data1-pack">
<p>second pack content</p>
<span>more second pack</span>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"data1-pack\">", "<p>first pack content</p>", "</div>", "<div class=\"other\">some other content</div>"},
				{"<div class=\"data1-pack\">", "<p>second pack content</p>", "<span>more second pack</span>", "</div>"},
			},
		},
		{
			name: "data1-pack div with whitespace variations",
			htmlContent: `  <div class="data1-pack">
  <p>content with spaces</p>
  </div>
<div class="data1-pack">
<span>second pack</span>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"data1-pack\">", "<p>content with spaces</p>", "</div>"},
				{"<div class=\"data1-pack\">", "<span>second pack</span>", "</div>"},
			},
		},
		{
			name: "html escaped content",
			htmlContent: `&lt;div class=&quot;data1-pack&quot;&gt;
&lt;p&gt;escaped content&lt;/p&gt;
&lt;/div&gt;
<div class="data1-pack">
<p>normal content</p>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"data1-pack\">", "<p>escaped content</p>", "</div>"},
				{"<div class=\"data1-pack\">", "<p>normal content</p>", "</div>"},
			},
		},
		{
			name: "empty lines and mixed content",
			htmlContent: `

<div class="data1-pack">
<p>first section</p>

<span>with empty lines</span>
</div>


<div class="other">ignored content</div>

<div class="data1-pack">

<p>second section</p>
</div>

`,
			expectedResult: [][]string{
				{"", ""},
				{"<div class=\"data1-pack\">", "<p>first section</p>", "", "<span>with empty lines</span>", "</div>", "", "", "<div class=\"other\">ignored content</div>", ""},
				{"<div class=\"data1-pack\">", "", "<p>second section</p>", "</div>", "", ""},
			},
		},
		{
			name: "data1-pack div at end",
			htmlContent: `<p>some initial content</p>
<div class="data1-pack">
<p>pack content</p>
</div>`,
			expectedResult: [][]string{
				{"<p>some initial content</p>"},
				{"<div class=\"data1-pack\">", "<p>pack content</p>", "</div>"},
			},
		},
		{
			name: "consecutive data1-pack divs",
			htmlContent: `<div class="data1-pack">
<p>first pack</p>
</div>
<div class="data1-pack">
<p>second pack</p>
</div>
<div class="data1-pack">
<p>third pack</p>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"data1-pack\">", "<p>first pack</p>", "</div>"},
				{"<div class=\"data1-pack\">", "<p>second pack</p>", "</div>"},
				{"<div class=\"data1-pack\">", "<p>third pack</p>", "</div>"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := parseContentForWinfittsDetails(tt.htmlContent)

			assert.Equal(t, tt.expectedResult, result, "parsed content partitions should match expected")
		})
	}
}

func TestParseContentForWinfittsDetails_EdgeCases(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		htmlContent    string
		expectedResult [][]string
	}{
		{
			name:           "only whitespace",
			htmlContent:    "   \n\t  \n   ",
			expectedResult: [][]string{{"", "", ""}},
		},
		{
			name: "partial data1-pack class match",
			htmlContent: `<div class="data1-pack-partial">
<p>should not match</p>
</div>
<div class="prefix-data1-pack">
<p>should not match either</p>
</div>`,
			expectedResult: [][]string{{"<div class=\"data1-pack-partial\">", "<p>should not match</p>", "</div>", "<div class=\"prefix-data1-pack\">", "<p>should not match either</p>", "</div>"}},
		},
		{
			name: "data1-pack in content but not in class",
			htmlContent: `<div class="other">
<p>content mentioning data1-pack</p>
</div>
<div class="data1-pack">
<p>actual data1-pack div</p>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"other\">", "<p>content mentioning data1-pack</p>", "</div>"},
				{"<div class=\"data1-pack\">", "<p>actual data1-pack div</p>", "</div>"},
			},
		},
		{
			name: "very long content",
			htmlContent: func() string {
				content := "<div class=\"data1-pack\">\n"
				for i := 0; i < 1000; i++ {
					content += "<p>line " + string(rune('0'+i%10)) + "</p>\n"
				}
				content += "</div>"
				return content
			}(),
			expectedResult: func() [][]string {
				expected := []string{"<div class=\"data1-pack\">"}
				for i := 0; i < 1000; i++ {
					expected = append(expected, "<p>line "+string(rune('0'+i%10))+"</p>")
				}
				expected = append(expected, "</div>")
				return [][]string{expected}
			}(),
		},
		{
			name: "special characters in content",
			htmlContent: `<div class="data1-pack">
<p>Special chars: &amp; &lt; &gt; &quot; &#39;</p>
<span>Unicode: 測試 プロジェクト</span>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"data1-pack\">", "<p>Special chars: & < > \" '</p>", "<span>Unicode: 測試 プロジェクト</span>", "</div>"},
			},
		},
		{
			name: "nested divs with data1-pack",
			htmlContent: `<div class="outer">
<div class="data1-pack">
<div class="inner">
<p>nested content</p>
</div>
</div>
<div class="data1-pack">
<p>second pack</p>
</div>
</div>`,
			expectedResult: [][]string{
				{"<div class=\"outer\">"},
				{"<div class=\"data1-pack\">", "<div class=\"inner\">", "<p>nested content</p>", "</div>", "</div>"},
				{"<div class=\"data1-pack\">", "<p>second pack</p>", "</div>", "</div>"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := parseContentForWinfittsDetails(tt.htmlContent)

			assert.Equal(t, tt.expectedResult, result, "parsed content partitions should handle edge cases correctly")
		})
	}
}
